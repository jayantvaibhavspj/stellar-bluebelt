import { useState, useEffect } from 'react';
import {
  Contract,
  TransactionBuilder,
  Networks,
  Account,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';
import * as freighterApi from '@stellar/freighter-api';
import './App.css';

const CONTRACT_ID = 'CDVKXMYN2STPUCCUY742YSNHTM3KJFPPJIW3CKMS7N6SIS3IWKHXS3RJ';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const RPC_URL = 'https://soroban-testnet.stellar.org';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

// Pure raw RPC call
const callRPC = async (method, params) => {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.result;
};

const App = () => {
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState('0');
  const [streamCount, setStreamCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [receiver, setReceiver] = useState('');
  const [rate, setRate] = useState('');
  const [duration, setDuration] = useState('');
  const [deposit, setDeposit] = useState('');
  const [isSending, setIsSending] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const connected = await freighterApi.isConnected();
      if (!connected?.isConnected) {
        setError('Please install Freighter wallet!');
        return;
      }
      await freighterApi.requestAccess();
      const addressResult = await freighterApi.getAddress();
      const pubKey = addressResult.address || addressResult;
      setPublicKey(pubKey);
      await fetchBalance(pubKey);
      setSuccess('Wallet connected!');
    } catch (err) {
      setError('Connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (address) => {
    try {
      const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
      const data = await res.json();
      const xlm = data.balances?.find(b => b.asset_type === 'native');
      setBalance(xlm ? parseFloat(xlm.balance).toFixed(2) : '0');
    } catch (err) {
      console.log('Balance error:', err.message);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setBalance('0');
    setStreamCount(0);
    setSuccess(null);
    setError(null);
    setReceiver('');
    setRate('');
    setDuration('');
    setDeposit('');
  };

  const createStream = async () => {
    if (!receiver || !rate || !duration || !deposit) {
      setError('Please fill all fields!');
      return;
    }
    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Get account sequence from Horizon
      const accRes = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
      const accInfo = await accRes.json();
      const sourceAccount = new Account(publicKey, accInfo.sequence);

      // Step 2: Build basic transaction XDR
      const contract = new Contract(CONTRACT_ID);
      const tx = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call(
          'create_stream',
          Address.fromString(publicKey).toScVal(),
          Address.fromString(receiver).toScVal(),
          nativeToScVal(parseInt(rate), { type: 'i128' }),
          nativeToScVal(parseInt(duration), { type: 'u64' }),
          nativeToScVal(parseInt(deposit), { type: 'i128' }),
        ))
        .setTimeout(180)
        .build();

      const txXdr = tx.toEnvelope().toXDR('base64');
      console.log('Built TX XDR');

      // Step 3: Simulate via raw RPC to get soroban data
      const simResult = await callRPC('simulateTransaction', { transaction: txXdr });
      console.log('Sim result:', JSON.stringify(simResult).slice(0, 200));

      if (simResult.error) throw new Error('Sim error: ' + simResult.error);

      // Step 4: Rebuild TX with proper fee from simulation
      const minFee = parseInt(simResult.minResourceFee || '50000');
      const totalFee = (minFee + 1000).toString();

      // Get fresh sequence
      const accRes2 = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
      const accInfo2 = await accRes2.json();
      const sourceAccount2 = new Account(publicKey, accInfo2.sequence);

      const tx2 = new TransactionBuilder(sourceAccount2, {
        fee: totalFee,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call(
          'create_stream',
          Address.fromString(publicKey).toScVal(),
          Address.fromString(receiver).toScVal(),
          nativeToScVal(parseInt(rate), { type: 'i128' }),
          nativeToScVal(parseInt(duration), { type: 'u64' }),
          nativeToScVal(parseInt(deposit), { type: 'i128' }),
        ))
        .setTimeout(180)
        .build();

      // Step 5: Apply soroban transaction data via XDR manipulation
      const tx2Envelope = tx2.toEnvelope();
      const txV1 = tx2Envelope.v1();

      // Set soroban data
      if (simResult.transactionData) {
        const sorobanData = xdr.SorobanTransactionData.fromXDR(
          simResult.transactionData, 'base64'
        );
        txV1.tx().ext(
          new xdr.TransactionExt(1, sorobanData)
        );
      }

      // Set auth on operation
      if (simResult.results?.[0]?.auth?.length > 0) {
        const authEntries = simResult.results[0].auth.map(a =>
          xdr.SorobanAuthorizationEntry.fromXDR(a, 'base64')
        );
        const op = txV1.tx().operations()[0];
        const invokeOp = op.body().invokeHostFunctionOp();
        invokeOp.auth(authEntries);
      }

      // Rebuild final XDR
      const finalXdr = tx2Envelope.toXDR('base64');
      console.log('Final TX XDR ready');

      // Step 6: Sign with Freighter
      const signResult = await freighterApi.signTransaction(finalXdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      if (signResult.error) throw new Error('Sign error: ' + signResult.error);
      const signedXdr = signResult.signedTxXdr || signResult;
      console.log('Signed!');

      // Step 7: Send via raw RPC
      const sendResult = await callRPC('sendTransaction', { transaction: signedXdr });
      console.log('Send result:', sendResult);

      if (sendResult.status === 'ERROR') {
        throw new Error('TX failed: ' + JSON.stringify(sendResult));
      }

      setSuccess('🎉 Stream created! TX: ' + sendResult.hash);
      await fetchBalance(publicKey);
      setReceiver('');
      setRate('');
      setDuration('');
      setDeposit('');
    } catch (err) {
      console.log('Full error:', err);
      setError('Failed: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const getStreamCount = async () => {
    try {
      const accRes = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
      const accInfo = await accRes.json();
      const sourceAccount = new Account(publicKey, accInfo.sequence);
      const contract = new Contract(CONTRACT_ID);

      const tx = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('get_stream_count'))
        .setTimeout(30)
        .build();

      const txXdr = tx.toEnvelope().toXDR('base64');
      const result = await callRPC('simulateTransaction', { transaction: txXdr });

      if (result.results?.[0]?.xdr) {
        const retval = xdr.ScVal.fromXDR(result.results[0].xdr, 'base64');
        const count = scValToNative(retval);
        setStreamCount(Number(count));
        setSuccess('Total streams: ' + count);
      }
    } catch (err) {
      setError('Failed: ' + err.message);
    }
  };

  useEffect(() => {
    if (publicKey) {
      const interval = setInterval(() => fetchBalance(publicKey), 15000);
      return () => clearInterval(interval);
    }
  }, [publicKey]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>💧 StellarFlow</h1>
          <p>Programmable Payment Streams on Stellar</p>
        </div>
        {publicKey && (
          <div className="wallet-badge">
            <span className="dot"></span>
            <span>{publicKey.slice(0, 6)}...{publicKey.slice(-4)}</span>
            <span className="balance-badge">{balance} XLM</span>
          </div>
        )}
      </header>

      <main className="main">
        {error && <div className="alert error">❌ {error}</div>}
        {success && <div className="alert success">✅ {success}</div>}

        {!publicKey ? (
          <div className="connect-card">
            <div className="hero">
              <h2>Stream Money Like Water 💧</h2>
              <p>Create continuous payment streams on Stellar Testnet.</p>
              <div className="features">
                <div className="feature">⚡ Real-time streaming</div>
                <div className="feature">⏸️ Pause anytime</div>
                <div className="feature">🔒 Secure</div>
                <div className="feature">💰 Any amount</div>
              </div>
            </div>
            <button onClick={connectWallet} disabled={loading} className="btn-connect">
              {loading ? '⏳ Connecting...' : '🔗 Connect Freighter Wallet'}
            </button>
          </div>
        ) : (
          <div className="dashboard">
            <div className="stats-row">
              <div className="stat-card">
                <label>Your Balance</label>
                <h3>{balance} XLM</h3>
              </div>
              <div className="stat-card">
                <label>Wallet</label>
                <h3>{publicKey.slice(0, 8)}...</h3>
              </div>
              <div className="stat-card" onClick={getStreamCount} style={{cursor:'pointer'}}>
                <label>Total Streams (Click)</label>
                <h3>{streamCount} 🔄</h3>
              </div>
            </div>

            <div className="tabs">
              <button
                className={activeTab === 'create' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('create')}
              >
                ➕ Create Stream
              </button>
              <button
                className={activeTab === 'info' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('info')}
              >
                ℹ️ How It Works
              </button>
            </div>

            {activeTab === 'create' && (
              <div className="card">
                <h2>Create Payment Stream</h2>
                <div className="form">
                  <div className="form-group">
                    <label htmlFor="receiver">Receiver Address</label>
                    <input
                      id="receiver"
                      type="text"
                      placeholder="G... (Stellar public key)"
                      value={receiver}
                      onChange={e => setReceiver(e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="rate">Rate (stroops/second)</label>
                      <input
                        id="rate"
                        type="number"
                        placeholder="e.g. 10"
                        value={rate}
                        onChange={e => setRate(e.target.value)}
                        disabled={isSending}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="duration">Duration (seconds)</label>
                      <input
                        id="duration"
                        type="number"
                        placeholder="e.g. 3600"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        disabled={isSending}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="deposit">Total Deposit (stroops)</label>
                    <input
                      id="deposit"
                      type="number"
                      placeholder="e.g. 36000"
                      value={deposit}
                      onChange={e => setDeposit(e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                  {rate && duration && (
                    <div className="preview">
                      💡 Streaming {rate} stroops/sec for {duration} sec = {rate * duration} stroops total
                    </div>
                  )}
                  <button onClick={createStream} disabled={isSending} className="btn-primary">
                    {isSending ? '⏳ Creating Stream...' : '💧 Create Stream'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="card">
                <h2>How StellarFlow Works</h2>
                <div className="steps">
                  <div className="step">
                    <span className="step-num">1</span>
                    <div>
                      <h4>Create a Stream</h4>
                      <p>Set receiver, rate per second, duration, and deposit</p>
                    </div>
                  </div>
                  <div className="step">
                    <span className="step-num">2</span>
                    <div>
                      <h4>Money Flows Continuously</h4>
                      <p>XLM streams to receiver every second automatically</p>
                    </div>
                  </div>
                  <div className="step">
                    <span className="step-num">3</span>
                    <div>
                      <h4>Receiver Withdraws</h4>
                      <p>Receiver can withdraw accrued balance anytime</p>
                    </div>
                  </div>
                  <div className="step">
                    <span className="step-num">4</span>
                    <div>
                      <h4>Cancel Anytime</h4>
                      <p>Sender can cancel stream and stop future payments</p>
                    </div>
                  </div>
                </div>
                <div className="contract-info">
                  <label>Contract ID (Testnet)</label>
                  <code>{CONTRACT_ID}</code>
                </div>
              </div>
            )}

            <button onClick={disconnectWallet} className="btn-disconnect">
              🔓 Disconnect
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>StellarFlow — Built for Stellar Blue Belt Challenge 🔵 | Testnet Only</p>
      </footer>
    </div>
  );
};

export default App;

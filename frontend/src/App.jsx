import { useState, useEffect } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import freighterApi from '@stellar/freighter-api';
import './App.css';

const CONTRACT_ID = 'CDVKXMYN2STPUCCUY742YSNHTM3KJFPPJIW3CKMS7N6SIS3IWKHXS3RJ';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const RPC_URL = 'https://soroban-testnet.stellar.org';

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
      // Check if Freighter is installed
      const isConnectedResult = await freighterApi.isConnected();
      if (!isConnectedResult.isConnected) {
        setError('Please install Freighter wallet!');
        return;
      }

      // Request access
      const accessResult = await freighterApi.requestAccess();
      if (accessResult.error) {
        setError('Access denied: ' + accessResult.error);
        return;
      }

      // Get public key
      const addressResult = await freighterApi.getAddress();
      if (addressResult.error) {
        setError('Could not get address: ' + addressResult.error);
        return;
      }

      const pubKey = addressResult.address;
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
      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await server.accounts().accountId(address).call();
      const xlm = account.balances.find(b => b.asset_type === 'native');
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
      const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const sourceAccount = await server.getAccount(publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call(
          'create_stream',
          StellarSdk.Address.fromString(publicKey).toScVal(),
          StellarSdk.Address.fromString(receiver).toScVal(),
          StellarSdk.nativeToScVal(parseInt(rate), { type: 'i128' }),
          StellarSdk.nativeToScVal(parseInt(duration), { type: 'u64' }),
          StellarSdk.nativeToScVal(parseInt(deposit), { type: 'i128' }),
        ))
        .setTimeout(180)
        .build();

      const prepared = await server.prepareTransaction(tx);
      const xdr = prepared.toEnvelope().toXDR('base64');

      const signResult = await freighterApi.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      if (signResult.error) {
        setError('Signing failed: ' + signResult.error);
        return;
      }

      const txEnvelope = StellarSdk.TransactionBuilder.fromXDR(
        signResult.signedTxXdr,
        NETWORK_PASSPHRASE
      );
      const result = await server.sendTransaction(txEnvelope);

      setSuccess('Stream created! TX: ' + result.hash);
      await fetchBalance(publicKey);
      setReceiver('');
      setRate('');
      setDuration('');
      setDeposit('');
    } catch (err) {
      setError('Failed: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const getStreamCount = async () => {
    try {
      const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const sourceAccount = await server.getAccount(publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('get_stream_count'))
        .setTimeout(30)
        .build();

      const result = await server.simulateTransaction(tx);
      if (result.result) {
        const count = StellarSdk.scValToNative(result.result.retval);
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
              <p>Create continuous payment streams on Stellar Testnet. Pay per second, per minute, or per hour.</p>
              <div className="features">
                <div className="feature">⚡ Real-time streaming</div>
                <div className="feature">⏸️ Pause anytime</div>
                <div className="feature">🔒 Secure & transparent</div>
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
                <label>Total Streams (click)</label>
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
                    <label>Receiver Address</label>
                    <input
                      type="text"
                      placeholder="G... (Stellar public key)"
                      value={receiver}
                      onChange={e => setReceiver(e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Rate (stroops/second)</label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={rate}
                        onChange={e => setRate(e.target.value)}
                        disabled={isSending}
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration (seconds)</label>
                      <input
                        type="number"
                        placeholder="e.g. 3600"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        disabled={isSending}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Total Deposit (stroops)</label>
                    <input
                      type="number"
                      placeholder="e.g. 36000"
                      value={deposit}
                      onChange={e => setDeposit(e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                  {rate && duration && (
                    <div className="preview">
                      💡 Streaming {rate} stroops/sec for {duration} seconds = {rate * duration} stroops total
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
                      <p>Set receiver, rate per second, duration, and deposit amount</p>
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

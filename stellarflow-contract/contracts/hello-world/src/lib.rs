#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Symbol, Vec, Map,
};

#[contracttype]
#[derive(Clone)]
pub struct Stream {
    pub sender: Address,
    pub receiver: Address,
    pub rate_per_second: i128,
    pub start_time: u64,
    pub end_time: u64,
    pub withdrawn: i128,
    pub is_active: bool,
    pub deposited: i128,
}

#[contracttype]
pub enum DataKey {
    Stream(u64),
    StreamCount,
    Balance(Address),
}

const STREAM_CREATED: Symbol = symbol_short!("CREATED");
const STREAM_CANCELLED: Symbol = symbol_short!("CANCELLED");
const WITHDRAWN: Symbol = symbol_short!("WITHDRAWN");

#[contract]
pub struct StellarFlowContract;

#[contractimpl]
impl StellarFlowContract {
    pub fn create_stream(
        env: Env,
        sender: Address,
        receiver: Address,
        rate_per_second: i128,
        duration_seconds: u64,
        deposit: i128,
    ) -> u64 {
        sender.require_auth();

        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::StreamCount)
            .unwrap_or(0);

        let stream_id = count + 1;

        let start_time = env.ledger().timestamp();
        let end_time = start_time + duration_seconds;

        let stream = Stream {
            sender: sender.clone(),
            receiver,
            rate_per_second,
            start_time,
            end_time,
            withdrawn: 0,
            is_active: true,
            deposited: deposit,
        };

        env.storage()
            .instance()
            .set(&DataKey::Stream(stream_id), &stream);

        env.storage()
            .instance()
            .set(&DataKey::StreamCount, &stream_id);

        env.events()
            .publish((STREAM_CREATED, stream_id), sender);

        stream_id
    }

    pub fn get_stream(env: Env, stream_id: u64) -> Stream {
        env.storage()
            .instance()
            .get(&DataKey::Stream(stream_id))
            .unwrap()
    }

    pub fn withdrawable(env: Env, stream_id: u64) -> i128 {
        let stream: Stream = env
            .storage()
            .instance()
            .get(&DataKey::Stream(stream_id))
            .unwrap();

        if !stream.is_active {
            return 0;
        }

        let now = env.ledger().timestamp();
        let elapsed = if now >= stream.end_time {
            stream.end_time - stream.start_time
        } else {
            now - stream.start_time
        };

        let earned = stream.rate_per_second * elapsed as i128;
        let available = earned - stream.withdrawn;

        if available > stream.deposited - stream.withdrawn {
            stream.deposited - stream.withdrawn
        } else if available < 0 {
            0
        } else {
            available
        }
    }

    pub fn withdraw(env: Env, stream_id: u64, receiver: Address) -> i128 {
        receiver.require_auth();

        let mut stream: Stream = env
            .storage()
            .instance()
            .get(&DataKey::Stream(stream_id))
            .unwrap();

        assert!(stream.receiver == receiver, "Not the receiver");
        assert!(stream.is_active, "Stream not active");

        let amount = Self::withdrawable(env.clone(), stream_id);
        assert!(amount > 0, "Nothing to withdraw");

        stream.withdrawn += amount;
        env.storage()
            .instance()
            .set(&DataKey::Stream(stream_id), &stream);

        env.events()
            .publish((WITHDRAWN, stream_id), amount);

        amount
    }

    pub fn cancel_stream(env: Env, stream_id: u64, sender: Address) {
        sender.require_auth();

        let mut stream: Stream = env
            .storage()
            .instance()
            .get(&DataKey::Stream(stream_id))
            .unwrap();

        assert!(stream.sender == sender, "Not the sender");
        assert!(stream.is_active, "Already cancelled");

        stream.is_active = false;
        env.storage()
            .instance()
            .set(&DataKey::Stream(stream_id), &stream);

        env.events()
            .publish((STREAM_CANCELLED, stream_id), sender);
    }

    pub fn get_stream_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::StreamCount)
            .unwrap_or(0)
    }
}

mod tests;
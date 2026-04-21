#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Env};

#[test]
fn test_create_stream() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(StellarFlowContract, ());
    let client = StellarFlowContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);

    let stream_id = client.create_stream(
        &sender,
        &receiver,
        &10,
        &100,
        &1000,
    );

    assert_eq!(stream_id, 1);
}

#[test]
fn test_withdrawable() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|l| l.timestamp = 1000);
    let contract_id = env.register(StellarFlowContract, ());
    let client = StellarFlowContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.create_stream(&sender, &receiver, &10, &100, &1000);

    env.ledger().with_mut(|l| l.timestamp = 1050);

    let amount = client.withdrawable(&1);
    assert_eq!(amount, 500);
}

#[test]
fn test_cancel_stream() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|l| l.timestamp = 1000);
    let contract_id = env.register(StellarFlowContract, ());
    let client = StellarFlowContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.create_stream(&sender, &receiver, &10, &100, &1000);
    client.cancel_stream(&1, &sender);

    let stream = client.get_stream(&1);
    assert_eq!(stream.is_active, false);
}

#[test]
fn test_stream_count() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(StellarFlowContract, ());
    let client = StellarFlowContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.create_stream(&sender, &receiver, &10, &100, &1000);
    client.create_stream(&sender, &receiver, &5, &200, &500);

    let count = client.get_stream_count();
    assert_eq!(count, 2);
}
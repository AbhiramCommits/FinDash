CREATE DATABASE findash_db;

\c findash_db;

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('hedge_fund', 'bank', 'custody'))
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'analyst', 'viewer'))
);

CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    trade_date DATE NOT NULL,
    asset VARCHAR(255) NOT NULL,
    notional FLOAT NOT NULL,
    execution_price FLOAT NOT NULL,
    benchmark_price FLOAT NOT NULL,
    slippage_bps FLOAT NOT NULL,
    algo_used VARCHAR(255) NOT NULL,
    client_id INTEGER NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE INDEX idx_trades_trade_date ON trades(trade_date);
CREATE INDEX idx_trades_client_id ON trades(client_id);

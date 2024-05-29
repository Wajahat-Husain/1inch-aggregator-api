# 1inch Aggregator Token Swap backend

The backend handles all interactions with the 1inch v6 API to fetch the best trade routes and execute token swaps on the Polygon network.

## Features
- API endpoints for token price fetching and swapping
- Secure interaction with the 1inch v6 API
- Optimized for low gas fees and minimal slippage

## Installation
1. Clone the repository:

   ```
   git clone https://github.com/Wajahat-Husain/1inch-aggregator-api.git
   cd backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a .env file in the root directory and add your moralis key and 1 inch Auth token:
    ```
   MORALIS_KEY = 
   AUTH_TOKEN = 
   ```

4. Start the development server:

   ```
   npm start
   npm run dev
   ```

# API Endpoints
- GET /tokenPrice : Fetches current token prices.
- GET /approve/spender: Fetch spender address for token approvals, In our case it will be swap contract on   specified chain.
- GET /approve/allowance: Fetch token allowance.
- GET /approve/transaction: Fetch approval transaction created data
- GET /call/swap: Fetch swap transaction created data
- Get /tokens: Fetch all the token that are avaliable on that chain to swap

## Tech Stack
- Node.js
- Express.js
- 1inch API
- Moralis





# 1inch Aggregator Token Swap frontend

The frontend of this application allows users to seamlessly swap tokens on the Polygon network. It interacts with the backend to perform the swaps using the 1inch aggregator API.

## Features
- User-friendly interface for token swaps
- Real-time token prices and swap rates
- Integration with MetaMask for secure transactions


## Screenshot
<p align="center">
  <img width="700" src="https://pink-empty-wombat-938.mypinata.cloud/ipfs/QmR3AFRKCrVjiZSz7VgB8Bk7xAFyYGVBxeoiVcmmVUPrs4" alt="cli output"/>
</p>

## Installation
1. Clone the repository:

   ```
   git clone https://github.com/Wajahat-Husain/1inch-aggregator-api.git
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a .env file in the root directory and add your backend base url:
    ```
   VITE_API_BASE_URL = 
   VITE_FEE_WALLET_ADDRESS = 
   VITE_FEE_PERCENTAGE = 
   ```

4. Start the development server:

   ```
   npm run dev
   ```

5. Open your browser and navigate to http://localhost:5173.

## Usage
1. Connect your MetaMask wallet.
2. Select the tokens you wish to swap.
3. Enter the amount of tokens.
4. Review the swap details.
5. Confirm the swap.

## Tech Stack
- React
- etherjs
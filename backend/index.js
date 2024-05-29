import express from "express";
import Moralis from "moralis";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
// Initializing dotenv to load environment variables
dotenv.config();

// Initializing Express app
const app = express();
const port = process.env.PORT || 3300;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to map addresses
const addressMapper = (address) =>
  address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ? "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
    : address;

// Helper function to get token price from Moralis API
const getTokenPrice = async (address) => {
  const response = await Moralis.EvmApi.token.getTokenPrice({
    chain: "0x89",
    include: "percent_change",
    address,
  });
  return response.raw.usdPrice;
};

// Route to get token prices
app.get("/tokenPrice", async (req, res) => {
  try {
    const { query } = req;
    query.addressOne = addressMapper(query.addressOne);
    query.addressTwo = addressMapper(query.addressTwo);

    const [tokenOnePrice, tokenTwoPrice] = await Promise.all([
      getTokenPrice(query.addressOne),
      getTokenPrice(query.addressTwo),
    ]);

    const usdPrices = {
      tokenOne: tokenOnePrice,
      tokenTwo: tokenTwoPrice,
      ratio: tokenOnePrice / tokenTwoPrice,
    };

    return res.status(200).json(usdPrices);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error: "Error fetching token prices" });
  }
});

// Helper function to interact with 1inch API
const getFrom1inchAPI = async (url, config) => {
  try {
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error(error.response.data);
    throw new Error("1inch API request failed");
  }
};

// Route to get the spender address for token approvals
app.get("/approve/spender", async (req, res) => {
  try {
    const { chainId } = req.query;
    const url = `https://api.1inch.dev/swap/v6.0/${chainId}/approve/spender`;
    const config = {
      headers: { Authorization: `Bearer ${process.env.AUTH_TOKEN}` },
    };
    const data = await getFrom1inchAPI(url, config);
    res.status(200).send({ success: true, data });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

// Route to check token allowance
app.get("/approve/allowance", async (req, res) => {
  try {
    const { chainId, tokenAddress, walletAddress } = req.query;
    const url = `https://api.1inch.dev/swap/v6.0/${chainId}/approve/allowance`;
    const config = {
      headers: { Authorization: `Bearer ${process.env.AUTH_TOKEN}` },
      params: { tokenAddress, walletAddress },
    };
    const data = await getFrom1inchAPI(url, config);
    res.status(200).send({ success: true, data });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

// Route to create an approval transaction
app.get("/approve/transaction", async (req, res) => {
  try {
    const { chainId, tokenAddress, amount } = req.query;
    const url = `https://api.1inch.dev/swap/v6.0/${chainId}/approve/transaction`;
    const config = {
      headers: { Authorization: `Bearer ${process.env.AUTH_TOKEN}` },
      params: { tokenAddress, amount },
    };
    const data = await getFrom1inchAPI(url, config);
    res.status(200).send({ success: true, data });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

// Route to perform a swap transaction
app.get("/call/swap", async (req, res) => {
  try {
    const { chainId, src, dst, amount, from, slippage } = req.query;
    console.log({ chainId, src, dst, amount, from, slippage })
    const url = `https://api.1inch.dev/swap/v6.0/${chainId}/swap`;
    const config = {
      headers: { Authorization: `Bearer ${process.env.AUTH_TOKEN}` },
      params: {
        src,
        dst,
        amount,
        from,
        slippage,
        disableEstimate: false,
        allowPartialFill: false,
      },
    };
    const data = await getFrom1inchAPI(url, config);
    res.status(200).send({ success: true, data });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

// Route to get a quote for a swap transaction
app.get("/quote", async (req, res) => {
  try {
    const { chainId, src, dst, amount } = req.query;
    const url = `https://api.1inch.dev/swap/v6.0/${chainId}/quote`;
    const config = {
      headers: { Authorization: `Bearer ${process.env.AUTH_TOKEN}` },
      params: { src, dst, amount },
    };
    const data = await getFrom1inchAPI(url, config);
    res.status(200).send({ success: true, data });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

// Route to get tokens available for swap on a given chain
app.get("/tokens", async (req, res) => {
  try {
    const { chainId } = req.query;
    const url = `https://api.1inch.dev/swap/v6.0/${chainId}/tokens`;
    const config = {
      headers: { Authorization: `Bearer ${process.env.AUTH_TOKEN}` },
    };
    const response = await axios.get(url, config);
    const tokens = response?.data?.tokens;

    // Map the tokens object to the desired array format
    const formattedTokens = Object.values(tokens).map((token) => ({
      ticker: token.symbol,
      name: token.name,
      img: token.logoURI,
      address: token.address,
      decimals: Number(token.decimals),
    }));

    // Limit the results to 10 tokens (if required)
    // const limitedTokens = formattedTokens.slice(0, 10);
    const limitedTokens = formattedTokens.slice(74);

    return res.status(200).send({ success: true, data: limitedTokens });
  } catch (error) {
    console.error(error.response.statusText);
    res.status(500).send({ success: false, error: "Failed to fetch tokens" });
  }
});

// Starting the server
Moralis.start({ apiKey: process.env.MORALIS_KEY }).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

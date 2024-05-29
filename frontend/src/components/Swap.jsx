import React, { useState, useEffect, useContext } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { parseUnits } from "ethers";
import ConnectionContext from "../context/ConnectionContext";

const Swap = () => {
  const { userInfo, signer, isConnected } = useContext(ConnectionContext);
  const [tokens, setTokens] = useState([]);
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState("");
  const [tokenTwoAmount, setTokenTwoAmount] = useState("");
  const [tokenOne, setTokenOne] = useState(null);
  const [tokenTwo, setTokenTwo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (isConnected) {
      fetchTokens();
    }
  }, [isConnected]);

  useEffect(() => {
    if (tokenOne && tokenTwo) {
      fetchPrices(tokenOne.address, tokenTwo.address);
    }
  }, [tokenOne, tokenTwo]);

  const fetchTokens = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/tokens`,
        {
          params: { chainId: userInfo?.chainId },
        }
      );
      const fetchedTokens = data.data;
      console.log(fetchedTokens);
      setTokens(fetchedTokens);
      if (fetchedTokens.length > 1) {
        setTokenOne(fetchedTokens[0]);
        setTokenTwo(fetchedTokens[1]);
      }
    } catch (error) {
      console.error("Error fetching tokens", error);
      messageApi.error("Failed to fetch tokens");
    }
  };

  const fetchPrices = async (one, two) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/tokenPrice`,
        {
          params: { addressOne: one, addressTwo: two },
        }
      );
      setPrices(data);
    } catch (error) {
      console.error("Error fetching prices", error);
      messageApi.error("Failed to fetch token prices");
    }
  };

  const handleSlippageChange = (e) => setSlippage(e.target.value);

  const changeAmount = (e) => {
    const value = e.target.value;
    setTokenOneAmount(value);
    if (value && prices) {
      setTokenTwoAmount((value * prices.ratio).toFixed(12));
    } else {
      setTokenTwoAmount("");
    }
  };

  const switchTokens = () => {
    setTokenOneAmount("");
    setTokenTwoAmount("");
    setPrices(null);
    setTokenOne(tokenTwo);
    setTokenTwo(tokenOne);
  };

  const openModal = (asset) => {
    setChangeToken(asset);
    setIsOpen(true);
  };

  const modifyToken = (index) => {
    const selectedToken = tokens[index];
    setPrices(null);
    setTokenOneAmount("");
    setTokenTwoAmount("");
    if (changeToken === 1) {
      setTokenOne(selectedToken);
    } else {
      setTokenTwo(selectedToken);
    }
    setIsOpen(false);
  };

  const fetchDexSwap = async () => {
    try {
      const chainId = userInfo?.chainId;
      const amount = parseUnits(tokenOneAmount, tokenOne.decimals).toString();
      console.log(tokenOne.address);
      if (tokenOne.address !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/approve/allowance`,
          {
            params: {
              chainId,
              tokenAddress: tokenOne.address,
              walletAddress: userInfo?.account,
            },
          }
        );
        const allowance = data.data.allowance.toString();
        console.log(allowance < amount, allowance, amount);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (allowance < amount) {
          const { data: approveData } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/approve/transaction`,
            {
              params: {
                chainId,
                tokenAddress: tokenOne.address,
                amount,
              },
            }
          );
          await sendTransaction(approveData.data);
        }
      }

      const { data: swapData } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/call/swap`,
        {
          params: {
            chainId,
            src: tokenOne.address,
            dst: tokenTwo.address,
            amount,
            from: userInfo?.account,
            slippage,
          },
        }
      );

      const decimals = Number(`1E${tokenTwo.decimals}`);
      setTokenTwoAmount(
        (Number(swapData.data.dstAmount) / decimals).toFixed(2)
      );
      await sendTransaction(swapData.data.tx);
      setTokenOneAmount("");
      setTokenTwoAmount("");
    } catch (error) {
      console.error(error);
      messageApi.error("Swap transaction failed");
    }
  };

  const sendTransaction = async (details) => {
    try {
      console.log(details);
      const tx = await signer.sendTransaction({
        to: details.to,
        value: details.value,
        data: details.data,
      });
      await tx.wait();
    } catch (error) {}
  };

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
      {tokens.length > 0 && tokenOne && tokenTwo && (
        <>
          <Modal
            open={isOpen}
            footer={null}
            onCancel={() => setIsOpen(false)}
            title="Select a token"
          >
            <div className="modalContent">
              {tokens.map((e, i) => (
                <div
                  className="tokenChoice"
                  key={i}
                  onClick={() => modifyToken(i)}
                >
                  <img src={e.img} alt={e.ticker} className="tokenLogo" />
                  <div className="tokenChoiceNames">
                    <div className="tokenName">{e.name}</div>
                    <div className="tokenTicker">{e.ticker}</div>
                  </div>
                </div>
              ))}
            </div>
          </Modal>
          <div className="tradeBox">
            <div className="tradeBoxHeader">
              <h4>Swap</h4>
              <Popover
                content={settings}
                title="Settings"
                trigger="click"
                placement="bottomRight"
              >
                <SettingOutlined className="cog" />
              </Popover>
            </div>
            <div className="inputs">
              <Input
                placeholder="0"
                value={tokenOneAmount}
                onChange={changeAmount}
                disabled={!prices}
              />
              <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
              <div className="switchButton" onClick={switchTokens}>
                <ArrowDownOutlined className="switchArrow" />
              </div>
              <div className="assetOne" onClick={() => openModal(1)}>
                <img
                  src={tokenOne.img}
                  alt="assetOneLogo"
                  className="assetLogo"
                />
                {tokenOne.ticker}
                <DownOutlined />
              </div>
              <div className="assetTwo" onClick={() => openModal(2)}>
                <img
                  src={tokenTwo.img}
                  alt="assetTwoLogo"
                  className="assetLogo"
                />
                {tokenTwo.ticker}
                <DownOutlined />
              </div>
            </div>
            <div
              className="swapButton"
              disabled={!tokenOneAmount || !isConnected}
              onClick={fetchDexSwap}
            >
              Swap
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Swap;

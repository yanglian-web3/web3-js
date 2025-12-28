// src/config/simple-dex-config.ts
export const SIMPLE_DEX_CONFIG = {
    chainId: 31337,
    network: "localhost",

    // SimpleDEX 合约地址（根据您的部署更新）
    simpleDex: "0x21dF544947ba3E8b3c32561399E88B52Dc8b2823",

    // 代币配置
    tokens: {
        TKNA: {
            address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            symbol: "TKNA",
            name: "Token A",
            decimals: 18
        },
        TKNB: {
            address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            symbol: "TKNB",
            name: "Token B",
            decimals: 6
        }
    },

    // SimpleDEX ABI
    simpleDexABI: [
        "function swap(uint256 amountIn, address fromToken, uint256 minAmountOut) external returns (uint256)",
        "function getAmountOut(uint256 amountIn, address fromToken) view returns (uint256)",
        "function getReserves() view returns (uint256, uint256)",
        "function getPrice() view returns (uint256)",
        "function tokenA() view returns (address)",
        "function tokenB() view returns (address)",
        "function addLiquidity(uint256 amountA, uint256 amountB) external",
        "function removeLiquidity(uint256 amountA, uint256 amountB) external",
        "event Swap(address indexed sender, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)"
    ] as const,

    // ERC20 ABI
    erc20ABI: [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address account) view returns (uint256)",
        "function transfer(address recipient, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)"
    ] as const
};

// 获取默认代币地址
export const getDefaultTokenAddresses = () => {
    const tokens = Object.values(SIMPLE_DEX_CONFIG.tokens);
    return tokens.reduce((acc, token) => {
        acc[token.symbol] = token.address;
        return acc;
    }, {} as Record<string, string>);
};

// 获取所有代币地址数组
export const getAllTokenAddresses = () => {
    return Object.values(SIMPLE_DEX_CONFIG.tokens).map(token => token.address);
};
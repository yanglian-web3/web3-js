// src/constants/abis/erc20-human-readable.ts
/**
 * Human-Readable ABI - 最简洁的格式
 * 适合：快速开发、标准合约、教程示例
 */
export const ERC20_HUMAN_ABI = [
    // 基本信息查询
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",

    // 余额相关
    "function balanceOf(address owner) view returns (uint256)",

    // 转账相关
    "function transfer(address to, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",

    // 事件
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
] as const

/**
 * 最小化版本 - 仅转账功能
 */
export const ERC20_MINIMAL_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)"
] as const
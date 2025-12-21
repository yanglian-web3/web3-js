// 前端诊断工具 - 复制到浏览器控制台运行
// 代币查询测试

import {ethers} from "ethers";

export async function diagnoseTokenBalance() {
    console.log("🔍 前端代币余额诊断");

    if (!window.ethereum) {
        console.log("❌ 未检测到 MetaMask");
        return;
    }

    try {
        // 1. 检查当前网络
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        console.log("📡 当前网络:", {
            chainId: Number(network.chainId),
            name: network.name
        });

        // Hardhat 网络应该是 chainId 31337 (0x7a69)
        if (Number(network.chainId) !== 31337) {
            console.log("⚠️ 不在 Hardhat 网络，请切换到 localhost:8545");
        }

        // 2. 检查当前账户
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length === 0) {
            console.log("⚠️ 钱包未连接，请先连接");
            return;
        }

        const currentAccount = accounts[0];
        console.log("👤 当前账户:", currentAccount);

        // 3. 检查是否是 Hardhat 测试账户
        const hardhatAccounts = [
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
        ];

        const isHardhatAccount = hardhatAccounts.includes(currentAccount.toLowerCase());
        console.log("✅ 是否为 Hardhat 测试账户:", isHardhatAccount);

        // 4. 测试代币地址
        const tokens = [
            {
                name: "LINK",
                address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
                decimals: 18
            },
            {
                name: "DAI",
                address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
                decimals: 18
            },
            {
                name: "USDC",
                address: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
                decimals: 18 // 注意：你的 USDC 是 18 位小数，不是 6 位
            }
        ];

        // 5. 直接使用 ethers 查询余额
        console.log("\n💰 直接查询代币余额:");

        for (const token of tokens) {
            try {
                // 方法1: 使用 ethers.Contract
                const contract = new ethers.Contract(
                    token.address,
                    [
                        "function balanceOf(address) view returns (uint256)",
                        "function decimals() view returns (uint8)",
                        "function symbol() view returns (string)"
                    ],
                    provider
                );

                const balance = await contract.balanceOf(currentAccount);
                const decimals = await contract.decimals();
                const symbol = await contract.symbol();
                const formatted = ethers.formatUnits(balance, decimals);

                console.log(`  ${token.name} (${symbol}):`);
                console.log(`    余额: ${formatted}`);
                console.log(`    原始值: ${balance.toString()}`);
                console.log(`    小数位: ${decimals}`);

            } catch (error) {
                console.log(`  ❌ ${token.name} 查询失败:`, error.message);
            }
        }

        // 6. 检查 ETH 余额
        const ethBalance = await provider.getBalance(currentAccount);
        console.log("\n⛽ ETH 余额:", ethers.formatEther(ethBalance), "ETH");

    } catch (error) {
        console.log("❌ 诊断失败:", error);
    }
}
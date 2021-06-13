async function main() {

    // Deployment arguments
    const tokenName = "Steve Token";
    const tokenSymbol = "STEVE";
    const initialSupply = BigInt("1000000000000000000000000");


    const Steve = await ethers.getContractFactory("Steve");
    const steve = await Steve.deploy(tokenName, tokenSymbol, initialSupply);
    const owner = await steve.owner();
  
    console.log("Steve Token deployed to:", steve.address);
    console.log(`Owner: ${owner}`);
}
  
main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
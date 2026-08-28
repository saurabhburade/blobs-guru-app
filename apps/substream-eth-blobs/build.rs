use anyhow::{ Ok, Result };
use substreams_ethereum::Abigen;

fn main() -> Result<(), anyhow::Error> {
    Abigen::new("ERC20", "./abis/ERC20.json")?.generate()?.write_to_file("src/abi/ERC20.rs")?;
    Abigen::new("OneinchOracle", "./abis/OneinchOracle.json")?.generate()?.write_to_file("src/abi/OneinchOracle.rs")?;
    Abigen::new("ChainLinkOracle", "./abis/ChainLinkOracle.json")?.generate()?.write_to_file("src/abi/ChainLinkOracle.rs")?;
    Ok(())
}

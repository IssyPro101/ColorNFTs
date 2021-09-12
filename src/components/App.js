import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import Color from '../abis/Color.json'

class App extends Component {
  componentWillMount = async () => {
    window.addEventListener("load", this.startup, false);
    let account = await window.ethereum.request({ method: 'eth_accounts' });
    this.setState({account: account[0]})
    if (account[0]) {
      window.addEventListener("load", this.startup, false);
      this.setState({connected: true})
      await this.loadWeb3()
      await this.loadBlockchainData()
    }
  }

  connectWallet = async () => { 
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    let account = await window.ethereum.request({ method: 'eth_accounts' });
    this.setState({account: account[0]})
    this.setState({connected: true})

    const networkId = await web3.eth.net.getId()
    const networkData = Color.networks[networkId]
    if(networkData) {
      const abi = Color.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
      const totalSupply = await contract.methods.tokenCounter().call()
      this.setState({ totalSupply })
      // Load Colors
      for (var i = 1; i <= totalSupply; i++) {
        const color = await contract.methods.colors(i - 1).call()
        const tokenURI = await contract.methods.tokenURI(i-1).call()
        this.setState({
          colors: [...this.state.colors, color],
          tokenURIs: [...this.state.tokenURIs, tokenURI]
        })
      }

    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  mint = async (color) => {
    var d = new Date(Date.now());
    var n = d.toUTCString();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" height="500" width="500"><circle cx="250" cy="250" r="200" stroke="black" stroke-width="3" fill="'+color+'"/></svg>'
    await this.state.contract.methods.create(svg, color, n).send({ from: this.state.account })
    this.setState({
      colors: [...this.state.colors, color]
    })
    window.location.reload();
  }

  startup = () => {
    var colorWell = document.querySelector("#choose");
    colorWell.value = "#0000ff";
    colorWell.addEventListener("input", this.updateFirst, false);
    colorWell.addEventListener("change", this.updateAll, false);
    colorWell.select();
  }

  updateFirst = (event) => {
    var choose = document.querySelector("#choose");
    var hex = document.querySelector("#hex")

  
    if (choose) {
      choose.value = event.target.value;
      hex.value = event.target.value;
    }
  }

  updateAll = (event) => {
    var choose = document.querySelector("#choose")
    var hex = document.querySelector("#hex")
    choose.value = event.target.value;
    hex.value = event.target.value;
  }
  

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      selectedColor: '#000000',
      contract: null,
      totalSupply: 0,
      colors: [],
      connected: false,
      tokenURIs: []
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Color Tokens
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              {this.state.connected ? <small className="text-white"><span id="account">{this.state.account}</span></small> : <button class="btn btn-block btn-primary" onClick={this.connectWallet}>Connect</button>}
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const color = this.color.value;
                  this.mint(color)
                }}>
                  <input 
                    id="hex"
                    className='form-control mb-1'
                    ref={(input) => { this.color = input }}
                  />                  
                  <input 
                    type="color" 
                    className='form-control mb-1'
                    id="choose"
                    value=""
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='MINT'
                  />
                </form>
              </div>
            </main>
          </div>
          <hr/>
          <h1>My Minted Tokens</h1>
          <div className="row text-center">
            { this.state.colors.map((color, key) => {
              if (color.owner.toLowerCase() === this.state.account.toLowerCase()) {
                return(
                  <div key={key} id="color-wrap" className="col-md-3 mb-3">
                    <div className="token" style={{ backgroundColor: color.color }}></div>
                    <div>{color.color}</div>
                    <div>{color.owner}</div>
                    <div>{color.dateCreated}</div>
                    <div>Token URI: </div>
                    <textarea>{this.state.tokenURIs[key]}</textarea>
                  </div>
                )
              } else {
                return (<></>)
              }
            })}
          </div>
          <hr/>
          <h1>All Minted Tokens</h1>
          <div className="row text-center">
            { this.state.colors.map((color, key) => {
              return(
                <div key={key} id="color-wrap" className="col-md-3 mb-3">
                  <div className="token" style={{ backgroundColor: color.color }}></div>
                  <div>{color.color}</div>
                  <div>{color.owner}</div>
                  <div>{color.dateCreated}</div>
                  <div>Token URI: </div>
                  <textarea>{this.state.tokenURIs[key]}</textarea>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;

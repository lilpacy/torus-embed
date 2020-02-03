import { Component } from '@angular/core'
import web3Obj from './helper'
const tokenAbi = require('human-standard-token-abi')

declare const window: any

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  address: string
  balance: string
  buildEnvironment: string
  console: string
  selectedVerifier: string
  placeholder: string
  selectedVerifierId: string

  buildEnvironments = ['production', 'staging', 'testing', 'development']
  selectedVerifiers = [
    { label: 'Google', value: 'google' },
    { label: 'Reddit', value: 'reddit' },
    { label: 'Discord', value: 'discord' }
  ]

  async setStateInfo() {
    this.address = (await web3Obj.web3.eth.getAccounts())[0]
    this.balance = web3Obj.web3.utils.fromWei(await web3Obj.web3.eth.getBalance(this.address), 'ether')
  }

  printToConsole() {
    document.querySelector('#console>p').innerHTML = typeof this.console === 'object' ? JSON.stringify(this.console) : this.console
  }

  async setBuildEnvironment(e) {
    e.preventDefault()
    try {
      await web3Obj.initialize(this.buildEnvironment)
      this.setStateInfo()
    } catch (error) {
      console.error(error)
    }
  }

  changeProvider = async () => {
    await window.torus.setProvider({ host: 'ropsten' })
    this.console = 'finished changing provider'
    this.printToConsole()
  }

  async getUserInfo() {
    this.console = await window.torus.getUserInfo()
    this.printToConsole()
  }

  async logout() {
    await window.torus.cleanUp()
    this.address = ''
    this.balance = '0'
    sessionStorage.setItem('pageUsingTorus', 'false')
  }

  signMessage() {
    // hex message
    const message = '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'
    window.torus.web3.currentProvider.send(
      {
        method: 'eth_sign',
        params: [window.torus.web3.eth.accounts[0], message],
        from: window.torus.web3.eth.accounts[0]
      },
      (err, result) => {
        if (err) {
          return console.error(err)
        }
        this.console = `sign message => true \n ${result}`
      }
    )
  }

  signTypedData_v1 = () => {
    const typedData = [
      {
        type: 'string',
        name: 'message',
        value: 'Hi, Alice!'
      },
      {
        type: 'uint8',
        name: 'value',
        value: 10
      }
    ]
    window.torus.web3.currentProvider.send(
      {
        method: 'eth_signTypedData',
        params: [typedData, window.torus.web3.eth.accounts[0]],
        from: window.torus.web3.eth.accounts[0]
      },
      (err, result) => {
        if (err) {
          return console.error(err)
        }
        this.console = `sign typed message v1 => true \n, ${result}`
        this.printToConsole()
      }
    )
  }

  signTypedData_v3 = () => {
    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' }
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' }
        ]
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
        },
        contents: 'Hello, Bob!'
      }
    }
    window.torus.web3.currentProvider.send(
      {
        method: 'eth_signTypedData_v3',
        params: [window.torus.web3.eth.accounts[0], JSON.stringify(typedData)],
        from: window.torus.web3.eth.accounts[0]
      },
      (err, result) => {
        if (err) {
          return console.error(err)
        }
        this.console = `sign typed message v3 => true \n, ${result}`
        this.printToConsole()
      }
    )
  }

  signTypedData_v4() {
    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' }
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' }
        ],
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' }
        ]
      },
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      },
      primaryType: 'Mail',
      message: {
        from: {
          name: 'Cow',
          wallets: ['0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826', '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF']
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000'
            ]
          }
        ],
        contents: 'Hello, Bob!'
      }
    }
    window.torus.web3.currentProvider.send(
      {
        method: 'eth_signTypedData_v4',
        params: [window.torus.web3.eth.accounts[0], JSON.stringify(typedData)],
        from: window.torus.web3.eth.accounts[0]
      },
      (err, result) => {
        if (err) {
          return console.error(err)
        }
        this.console = `sign typed message v4 => true \n' ${result}`
        this.printToConsole()
      }
    )
  }

  async sendEth() {
    window.web3.eth.sendTransaction({ from: this.address, to: this.address, value: web3Obj.web3.utils.toWei('0.01') })
  }

  sendDai() {
    window.torus.setProvider({ host: 'mainnet' }).finally(() => {
      const localWeb3 = web3Obj.web3
      const instance = new localWeb3.eth.Contract(tokenAbi, '0x6b175474e89094c44da98b954eedeac495271d0f')
      const value = Math.floor(parseFloat('0.01') * 10 ** parseFloat('18')).toString()
      instance.methods.transfer(this.address, value).send(
        {
          from: this.address
        },
        (err, hash) => {
          if (err) this.console = err
          this.console = hash
        }
      )
    })
    this.printToConsole()
  }

  async createPaymentTx() {
    this.console = await window.torus.initiateTopup('moonpay', {
      selectedCurrency: 'USD'
    })
    this.printToConsole()
  }

  async getPublicAddress() {
    this.console = await window.torus.getPublicAddress({ verifier: this.selectedVerifier, verifierId: this.selectedVerifierId })
    this.printToConsole()
  }

  onSelectedVerifierChanged = event => {
    switch (event.target.value) {
      case 'google':
        this.placeholder = 'Enter google email'
        break
      case 'reddit':
        this.placeholder = 'Enter reddit username'
        break
      case 'discord':
        this.placeholder = 'Enter discord ID'
        break
      default:
        this.placeholder = 'Enter google email'
        break
    }
    this.selectedVerifier = event.target.value
  }
}

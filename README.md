[//]: # (SPDX-License-Identifier: CC-BY-4.0)

# OrbitDB Performance Experiment

This experiment shows how OrbitDB works.

The producer creates an OrbitDb database while the consumer connects to the OrbitDB database and replicates it.

## Installation
> First, deploy two VMs (one for producer and one for the consumer) and copy their respective folders into the machines.
> Install NodeJS 12 and then run NPM command inside producer and consumer folder:

`npm i`

Set the bootstrap addresses for both producer and consumer. To do it, start the producer to get the bootstrap address. The bootstrap address is of format:

`/ip4/<ip>/tcp/4001/p2p/<ipfs-id>`

Example: `/ip4/127.0.0.1/tcp/4001/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8`
```
===========================================
IPFS booted
-------------------------------------------
{
  id: 'QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8',
  publicKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQD5h4ol2do2vL+6Z3fRkJSeFxqZ3i/so/TkvhwqFf1RJMdUN6osJa3pbX8T5TvFktZmje7hGUzbVhvCH1Yxev0C31HBLNJZHvLnux4tmD439N5lAth16HRkN63+Jm3U1ftzRuCStcZP/d9acA3auAc/b/9RYkttnKAxwar+ED2UrhqnFgetvr6+f35pwLtZACfTRbYTUXRukQ9mVM/Kzy8CNnHYeK7N+xQLc/+LBi24Urm+ECV8nq4mpspjbB8lkTB6LEUQ3Qxoqhc2s+Ob+s5M6Ik/w+saivN6JHx4O58DRm63MviZrk1fPTQjazX1+auopOW9XrKspGtIy1LN/1n5AgMBAAE=',
  addresses: [
    <Multiaddr 047f000001060faba50322122007ebe4b9e9f0fd355ac0d8e12f7164a2e519f9903c0da4f42ac5dfef3f752e47 - /ip4/127.0.0.1/tcp/4001/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8>,
    <Multiaddr 047f000001060facdd03a50322122007ebe4b9e9f0fd355ac0d8e12f7164a2e519f9903c0da4f42ac5dfef3f752e47 - /ip4/127.0.0.1/tcp/4002/ws/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8>,
    <Multiaddr 04c0a8006a060faba50322122007ebe4b9e9f0fd355ac0d8e12f7164a2e519f9903c0da4f42ac5dfef3f752e47 - /ip4/192.168.0.106/tcp/4001/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8>,
    <Multiaddr 04c0a8006a060facdd03a50322122007ebe4b9e9f0fd355ac0d8e12f7164a2e519f9903c0da4f42ac5dfef3f752e47 - /ip4/192.168.0.106/tcp/4002/ws/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8>
  ],
  agentVersion: 'js-ipfs/0.46.0',
  protocolVersion: '9000'
}
===========================================
```

Then go to the consumer folder and in `config/config.js` add the swarm address to the bootstrap section. Once started the consumer pick up its swarm address and add as bootstrap for the producer. Then both are able to communicate in a bi-directional manner.
 

## Run Producer

After configuration run the producer like this:

`npm run producer`

On start, it will list the database address, which you need for the consumer as argument:

```
===========================================
Database initialized
Address: /orbitdb/zdpuAzoyTYPqa7BNa2Npm9hyrKcFX1HNNMzh5r8FK7nSdwg5W/producer
===========================================
```

## Run Consumer

To run the consumer you need to get the database address from the producer

`npm run consumer <db-address>`

Example:

`npm run start:consumer /orbitdb/zdpuAzoyTYPqa7BNa2Npm9hyrKcFX1HNNMzh5r8FK7nSdwg5W/producer`

You get the database address from the producers output:

## Troubleshooting

If you have replication issues related to the connections between participants.

1. To run them on the same computer the consumer must be on other ports than the producer

__The Consumer Config__
```js
   // CONSUMER CONFIG
    config: {
       Addresses: {
         Swarm: [
            // set to non-conflicting ports
           "/ip4/0.0.0.0/tcp/4011",
           "/ip4/0.0.0.0/tcp/4012/ws"
         ]
       },
       Bootstrap: [
          // the producers multiaddress string
          // The last segment is the ipfs id, which is different in your case
          // you get the address from the producers start up log (look for 'IPFS booted')
         "/ip4/127.0.0.1/tcp/4001/p2p/QmTW2V77WZzWXk1u7RQHwZGr9SMktVvibWns8oYwQsCfHQ"
       ]
     },
```

__The Producer Config__
```js
    config: {
       Addresses: {
         Swarm: [
           "/ip4/0.0.0.0/tcp/4001",
           "/ip4/0.0.0.0/tcp/4002/ws"
         ]
       },
       Bootstrap: [
          // the consumers multiaddress string
          // The last segment is the ipfs id, which is different in your case
          // you get the address from the consumers start up log (look for 'IPFS booted')
         "/ip4/127.0.0.1/tcp/4011/p2p/QmNsaBuMwSitVEneYSvUjbH7Z6c8A5YX5NQdkDsvccioh8"
       ]
     },
```

> For remote communication you need the external IPs and eventually configure firewall or port forwarding

2. The addresses need to be added to the bootstrap section in the config files (or added dynamically in the code)
    - the addresses may look like this `/ip4/77.56.45.83/tcp/4001/p2p/QmVmYesEWZm4L1YbrVhCvJEzCDNCvrU56E22HSDXiaCTy4`
    - the consumer needs the address from the producer, and vice versa
3. Check if your firewall is blocking the ports 4001 and 4002
4. Check if your ports are forwarded, i.e. activate port forwarding in the router  

## License <a name="license"></a>
Hyperledger Chaincode source code files are made available under the MIT License, located in the [LICENSE](LICENSE) file.
Hyperledger Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

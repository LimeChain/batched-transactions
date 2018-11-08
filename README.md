# MetaTx Based Batched Transactions Example

MetaTx have proved to be an useful tool for quite a lot use cases. One of the main pain-points of the ERC-20 is the non-atomicity of the interaction with it. You can see how we've managed to make these transactions atomic through the use of MetaTx Proxy (sometimes called identity).

## How to run it
```
npm install
npm start
```

## Making sense of the code
The code is in the test folder. It does the following things:

1. Creates a BatchedMetaTx Proxy, ERC-20 and Consumer service contracts
2. Produces the artifacts needed for two transactions - approve and transferFrom-based call to the Consumer contract
3. Executing them at once atomically
4. Executing failing transaction reverting both of them

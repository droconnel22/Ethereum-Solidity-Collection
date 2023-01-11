import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

import { withStyles,makeStyles } from '@material-ui/core/styles';
import {Grid, Button, TextField, Paper, Typography, IconButton, LinearProgress} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import CallIcon from '@material-ui/icons/Call';
import CakeIcon from '@material-ui/icons/Cake';

const HelloOracle = require("../../contracts/HelloOracle.json");
const HelloDex = require("../../contracts/HelloDex.json");

const helloOracleAddress = "0x149837399B4b8A00bFc0899c16E6fF4eAccb4532";

const helloDexAddress = "0x9BBC9e7a9A86bFe6C941523b5a13d66DA5f4A457";



const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
      color:"white"
    },
    container:{
       fontSize:"12px"  , 
    
    },
    paperHeader: {
        width:"80vw",
        background:'white',
        margin:theme.spacing(3, 0, 2),
        padding: theme.spacing(2)
    },
    paper:{
        margin:theme.spacing(3, 0, 2),
        padding: theme.spacing(2),
        background:'white',
        height:"300px",
        width:"80vw",
        overflow:"scroll"
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
        "background":"gray",
        "color":"black",
        '&:hover': {
          backgroundColor: 'darkgray !important',
        },
      },
}));

const kovanNetworkId = 42;
let initialState = {
    price: "0",
    wallet: null,
    helloContract:null
}

const HomePage = (props) => {

    const classes = useStyles();
    const [price,setPrice] = useState(0);
    const [wallet, setWallet] = useState(null);
    const [contractInstance, setContractInstance] = useState(null);
    const [dexInstance, setDexInstance] = useState(null);
    const [swapAmount, setSwapAmount] = useState(null);
    const [receipt, setReciept] = useState(null);
    const [working, setWorking] = useState(false);


    const [homeState, setHomeState] = useState(initialState);

    useEffect(async () => {
        if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            window.ethereum.enable();
           // alert("Metamask Connected!");
           setWallet(window.web3.currentProvider.selectedAddress);
          
        }        
        const networkId = await window.web3.eth.net.getId();
        let tempInstance =  await new window.web3.eth.Contract(HelloOracle.abi, helloOracleAddress);
        setContractInstance(tempInstance);
    
        console.log(tempInstance);

        let dexInstance = await new window.web3.eth.Contract(HelloDex.abi, helloDexAddress);
        setDexInstance(dexInstance);

        // listen for event emit PriceReceived(price, roundID, startedAt,timeStamp, answeredInRound);\
        tempInstance.events.PriceReceived(function(error, event){ 
            if(error){
                console.warn(error);
            }
            console.log(event);
            setPrice(window.web3.utils.fromWei(event.returnValues.price));
            setWorking(false);
         });

         dexInstance.events.Swapped(function (error, event) {
             if(error){
                 console.warn(error);
             }
             console.log(event);
             alert(event.returnValues);
             setWorking(false);
         });
        

    },[]);

    const onHandleOraclePrice = async (e) => {
        e.preventDefault();
        if(contractInstance) {
            setWorking(true);
            let receipt = await contractInstance.methods.getLatestPrice().send({ from: window.web3.currentProvider.selectedAddress  });
            setReciept(receipt.transactionHash);
            console.log(receipt);
        }
    }

    const onHandleDexTrigger = async (e) => {
        e.preventDefault();
        console.log(swapAmount);
        if(dexInstance){
            setWorking(true);
            let receipt = await dexInstance.methods.swapDaiForEth(window.web3.utils.toBN(swapAmount)).send({ from: window.web3.currentProvider.selectedAddress  });
            console.log(receipt);
        }
    }

    const onEthAmountChange = e => {
        e.preventDefault();
        setSwapAmount(e.target.value);
    }

    return (
        <React.Fragment>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <Paper className={classes.paperHeader}>
                        <Typography variant="h5" component="h5">
                        Connected to Wallet: {wallet}
                        </Typography>
                    
                    </Paper>
                </Grid>               
            </Grid>
            {working == false ? 
            <Grid container>

                <Grid item container xs={12}>               
                        <Paper className={classes.paper}>
                        <Grid container xs={12}>
                            <Grid item xs={4}>
                            <TextField
                                id="standard-number"
                                label="ETH Amount"
                                type="number"
                                onChange={onEthAmountChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                />
                            <IconButton onClick={onHandleDexTrigger}>
                                <CakeIcon /> 
                            </IconButton>
                            </Grid>
                            <Grid item xs={4}>
                            
                            </Grid>
                            <Grid item xs={4}>
                                
                            </Grid>
                        </Grid>    
                        </Paper>                   
                </Grid>
           
                <Grid item container xs={12}>               
                        <Paper className={classes.paper}>
                        <Grid container xs={12}>
                            <Grid item xs={4}>
                            <IconButton onClick={onHandleOraclePrice}>
                                <CallIcon /> 
                            </IconButton>
                            </Grid>
                            <Grid item xs={4}>
                            ETH/USD Price: {price} Ether
                            </Grid>
                            <Grid item xs={4}>
                                Reciept: {receipt}
                            </Grid>
                        </Grid>    
                        </Paper>                   
                </Grid>
            </Grid>
            :
            <Grid item container xs={12}>
                <paper className={classes.paper}>
                    <LinearProgress color="secondary" />
                </paper>
            </Grid>
            }
        </React.Fragment>    
)}

export default HomePage;
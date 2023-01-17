const axios = require('axios');
const cheerio = require('cheerio');
const exp = require('constants');
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));


app.get('/', (req, res) => {
    res.render('pages/index', {});
});


app.post('/update', (req, res) => {
    //capture data from user
    const urlInput = req.body.urlInput;
    const saleInput = req.body.saleInput;
    const emailInput = req.body.emailInput;
    const product = {name:'', price:'', link:''};

    //set timer to run scrape function every 20 seconds
    let handle = setInterval(scrape, 20000)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ikeasalemonitor',
          pass: 'kcsjdteorsfhsoxd'
        }
      });
    
    async function scrape(){
        //fetch data
        const {data} = await axios.get(urlInput);
        //load the html
        const $ = cheerio.load(data); 
        const item = $("main#content")
        //extract needed data
        product.name = $(item).find(".pip-header-section").text();
        price = $(item).find(".pip-temp-price__integer").first().text()
        product.link = urlInput
        priceNum = parseInt(price)
        
        //info within sent email
        var mailOptions = {
            from: 'ikeasalemonitor@gmail.com',
            to: emailInput,
            subject: 'IKEA Sale Monitor Price Notification',
            text: `The price of ${product.name} went below ${saleInput} dollars. Purchase it at ${urlInput}.`
          };
        
        //send email  
        if(priceNum <= saleInput){
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              clearInterval(handle);
        }else{
            console.log('re-scanning')
        }
    }
    res.render('pages/update', {});
    });


    app.listen(3000, () => {
    console.log('Running on port 3000')
});

const functions = require('firebase-functions');

//specify which urls have access to function
//origin=true allows any url access to this endpoint
const cors = require('cors')({origin:true});

//Node implementation of jquery
const cheerio = require('cheerio');

//extract urls from string
const getUrls = require('get-urls');
//fetch api in browser
const fetch = require('node-fetch');

const scrape = async (url)=>{
    var pricePatt = /(\$\d{3,5})/;
    var gradePatt =/(\d\d%)/;
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    //var list=[];
    const titleElems=$('div.views-field-title');
    console.log("Legnth is "+titleElems.length.toString());
    var promises = titleElems.map(async (elem) =>{
        
        console.log(elem);
        const link = $(titleElems[elem]).find('a')[0];
        if(link)
        {
           
            const url = $(link).attr('href');
            //console.log(url);
            const title = $(link).text();
            // list.push(
            //     {
            //         "url":url,
            //         "title":title,
            //     }
            // )
            const res2 = await fetch("https://uwaterloo.ca"+url);
            const html2 = await res2.text();
            const $2 = cheerio.load(html2);
            
            const awardDesc = $2('div.field-name-field-undergrad-award-desc');
            awardDescBody = $2(awardDesc[0]).find('p').text();

            awardDescBody = awardDescBody.replace(/,/g,"");
            
            const amount = awardDescBody.match(pricePatt);
            const grade = awardDescBody.match(gradePatt);
            var amountValue;
            var gradeValue;
            if(amount!==null&&amount.length>0)
            {
                //console.log(amount[0]);
                amountValue=parseInt(amount[0].substring(1));
                
            }
            else
            {
                //console.log("Unknown Price");
                amountValue=-1;
            }
            if(grade!==null&&grade.length>0)
            {
                //console.log(grade[0]);
                gradeValue=parseInt(grade[0].substring(0,grade[0].length-1));
            }
            else
            {
                //console.log("Unknown Grade");
                gradeValue=-1;
            }
            // console.log({
            //     url:url,
            //     title:title,
            //     amount:amountValue,
            //     grade:gradeValue
            // });
            return {
                url:url,
                title:title,
                amount:amountValue,
                grade:gradeValue
            };
            
        }
        return null;
    });

    console.log(typeof []);
    return Promise.all(promises.toArray());
   
}

const programList = async (url)=>{
    var pricePatt = /(\$\d{3,5})/;
    var gradePatt =/(\d\d%)/;
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    //var list=[];
    const selectPrograms=$('select#edit-program')[0];
    const listPrograms = $(selectPrograms).find('option');
    console.log(listPrograms.text());
    var promises = listPrograms.map(async (program) =>{
        
        console.log($(listPrograms[program]).text());
        const value = $(listPrograms[program]).attr('value');
        const name = $(listPrograms[program]).text();
        
          
            return {
                value:value,
                name:name,
            };
            
       
    });

    console.log(typeof []);
    return Promise.all(promises.toArray());
   
}

exports.scrape = functions.https.onRequest((request,response)=>{
    cors(request,response,async ()=>{
        //console.log(request.body.link);

        //const body=JSON.parse(request.body);
        const data = await scrape(request.body.link);
        console.log("Here's the data:");
        response.send(data);
    });
        //response.send("test");
});

exports.programList = functions.https.onRequest((request,response)=>{
    cors(request,response,async ()=>{
        //console.log(request.body.link);

        //const body=JSON.parse(request.body);
        const data = await programList("https://uwaterloo.ca/student-awards-financial-aid/awards/search-results?level=44&type=41&process=All&affiliation=All&program=53&term=163&citizenship=47&keyword=cumulative+average");
        console.log("Here's the data:");
        response.send(data);
    });
        //response.send("test");
});
// The Firebase Admin SDK to access Cloud Firestore.
//const admin = require('firebase-admin');
//admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

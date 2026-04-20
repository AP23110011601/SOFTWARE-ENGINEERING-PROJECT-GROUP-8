import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/Languagecontext";

const TR = {
  en: {
    brand:"SmartFarmer",
    nav:{ dashboard:"Dashboard", sensors:"Sensor Data", analysis:"Analysis", irrigation:"Irrigation", disease:"Disease", crops:"Crop Advisory", alerts:"Alerts" },
    logout:"Log Out", live:"Live",
    temp:"Temperature (°C)", humidity:"Humidity (%)", soilMoisture:"Soil Moisture (%)", tankLevel:"Tank Level (%)", rain:"Rain Detected", yes:"Yes", no:"No",
    saveBtn:"Save Sensor Readings", saving:"Saving...", savedAt:"Saved at",
    history:"7-Day Soil Moisture History",
    dashSub:"Here is what needs your attention today",
    analysisTitle:"Environmental & Yield Analysis", analysisSub:"AI insights generated from your sensor readings",
    irrigTitle:"Smart Irrigation & Water Management", irrigSub:"Irrigation decisions and water requirement for your whole farm",
    diseaseTitle:"Disease Detection & Prevention", diseaseSub:"Upload a crop photo for AI-powered disease diagnosis",
    cropTitle:"Crop Advisory System", cropSub:"Crop health monitoring and selection advisory",
    alertsTitle:"Farm Alerts & Notifications", alertsSub:"All active alerts generated from your sensor data",
    cropHealth:"Crop Health", yieldScore:"Yield Score", diseaseRisk:"Disease Risk", irrigNeed:"Irrigation Need",
    irrigDecision:"Irrigation Decision", waterReq:"Water Requirement (Whole Farm)", irrigSchedule:"Recommended Schedule",
    uploadPhoto:"Upload Crop Photo for AI Diagnosis", analyzePhoto:"Analyze with AI", analyzing:"Analyzing...", dragDrop:"Click or drag a photo here",
    photoHint:"Upload a clear photo of the affected leaf or crop area",
    diseaseResult:"AI Diagnosis Result", noPhoto:"Please upload a photo first",
    recommendedCrops:"Recommended Crops", whyThese:"Why these crops?", healthMonitor:"Crop Health Monitor", tips:"Advisory Tips",
  },
  te: {
    brand:"స్మార్ట్ ఫార్మర్",
    nav:{ dashboard:"డాష్‌బోర్డ్", sensors:"సెన్సార్ డేటా", analysis:"విశ్లేషణ", irrigation:"నీటిపారుదల", disease:"వ్యాధి", crops:"పంట సలహా", alerts:"హెచ్చరికలు" },
    logout:"లాగ్ అవుట్", live:"లైవ్",
    temp:"ఉష్ణోగ్రత (°C)", humidity:"తేమ (%)", soilMoisture:"నేల తేమ (%)", tankLevel:"ట్యాంక్ స్థాయి (%)", rain:"వర్షం గుర్తించబడింది", yes:"అవును", no:"లేదు",
    saveBtn:"సెన్సార్ రీడింగ్‌లు సేవ్ చేయండి", saving:"సేవ్ అవుతోంది...", savedAt:"సేవ్ అయింది",
    history:"7-రోజుల నేల తేమ చరిత్ర",
    dashSub:"ఈరోజు మీ దృష్టి అవసరమైన విషయాలు",
    analysisTitle:"పర్యావరణ & దిగుబడి విశ్లేషణ", analysisSub:"మీ సెన్సార్ రీడింగ్‌ల నుండి AI అంతర్దృష్టులు",
    irrigTitle:"స్మార్ట్ నీటిపారుదల & నీటి నిర్వహణ", irrigSub:"మీ మొత్తం పొలానికి నీటిపారుదల నిర్ణయాలు మరియు నీటి అవసరం",
    diseaseTitle:"వ్యాధి గుర్తింపు & నివారణ", diseaseSub:"AI ఆధారిత వ్యాధి నిర్ధారణ కోసం పంట ఫోటో అప్‌లోడ్ చేయండి",
    cropTitle:"పంట సలహా వ్యవస్థ", cropSub:"పంట ఆరోగ్య పర్యవేక్షణ మరియు ఎంపిక సలహా",
    alertsTitle:"పొలం హెచ్చరికలు & నోటిఫికేషన్లు", alertsSub:"మీ సెన్సార్ డేటా నుండి అన్ని సక్రియ హెచ్చరికలు",
    cropHealth:"పంట ఆరోగ్యం", yieldScore:"దిగుబడి స్కోర్", diseaseRisk:"వ్యాధి ప్రమాదం", irrigNeed:"నీటిపారుదల అవసరం",
    irrigDecision:"నీటిపారుదల నిర్ణయం", waterReq:"నీటి అవసరం (మొత్తం పొలం)", irrigSchedule:"సిఫారసు షెడ్యూల్",
    uploadPhoto:"AI నిర్ధారణ కోసం పంట ఫోటో అప్‌లోడ్ చేయండి", analyzePhoto:"AI తో విశ్లేషించు", analyzing:"విశ్లేషిస్తోంది...", dragDrop:"ఇక్కడ ఫోటో క్లిక్ చేయండి లేదా డ్రాగ్ చేయండి",
    photoHint:"ప్రభావిత ఆకు లేదా పంట ప్రాంతం యొక్క స్పష్టమైన ఫోటో అప్‌లోడ్ చేయండి",
    diseaseResult:"AI నిర్ధారణ ఫలితం", noPhoto:"దయచేసి ముందు ఫోటో అప్‌లోడ్ చేయండి",
    recommendedCrops:"సిఫారసు చేసిన పంటలు", whyThese:"ఈ పంటలు ఎందుకు?", healthMonitor:"పంట ఆరోగ్య పర్యవేక్షణ", tips:"సలహా చిట్కాలు",
  },
  hi: {
    brand:"स्मार्ट फार्मर",
    nav:{ dashboard:"डैशबोर्ड", sensors:"सेंसर डेटा", analysis:"विश्लेषण", irrigation:"सिंचाई", disease:"रोग", crops:"फसल सलाह", alerts:"अलर्ट" },
    logout:"लॉग आउट", live:"लाइव",
    temp:"तापमान (°C)", humidity:"नमी (%)", soilMoisture:"मिट्टी नमी (%)", tankLevel:"टैंक स्तर (%)", rain:"वर्षा का पता चला", yes:"हाँ", no:"नहीं",
    saveBtn:"सेंसर रीडिंग सेव करें", saving:"सेव हो रहा है...", savedAt:"सेव हुआ",
    history:"7-दिन मिट्टी नमी इतिहास",
    dashSub:"आज जिन चीजों पर ध्यान देना है",
    analysisTitle:"पर्यावरण और उत्पादन विश्लेषण", analysisSub:"आपके सेंसर रीडिंग से AI जानकारी",
    irrigTitle:"स्मार्ट सिंचाई और जल प्रबंधन", irrigSub:"आपके पूरे खेत के लिए सिंचाई निर्णय और पानी की जरूरत",
    diseaseTitle:"रोग पहचान और रोकथाम", diseaseSub:"AI-संचालित रोग निदान के लिए फसल फोटो अपलोड करें",
    cropTitle:"फसल सलाह प्रणाली", cropSub:"फसल स्वास्थ्य निगरानी और चयन सलाह",
    alertsTitle:"खेत अलर्ट और सूचनाएं", alertsSub:"आपके सेंसर डेटा से सभी सक्रिय अलर्ट",
    cropHealth:"फसल स्वास्थ्य", yieldScore:"उत्पादन स्कोर", diseaseRisk:"रोग जोखिम", irrigNeed:"सिंचाई जरूरत",
    irrigDecision:"सिंचाई निर्णय", waterReq:"पानी की जरूरत (पूरा खेत)", irrigSchedule:"अनुशंसित शेड्यूल",
    uploadPhoto:"AI निदान के लिए फसल फोटो अपलोड करें", analyzePhoto:"AI से विश्लेषण करें", analyzing:"विश्लेषण हो रहा है...", dragDrop:"यहाँ फोटो क्लिक या ड्रैग करें",
    photoHint:"प्रभावित पत्ती या फसल क्षेत्र की स्पष्ट फोटो अपलोड करें",
    diseaseResult:"AI निदान परिणाम", noPhoto:"कृपया पहले फोटो अपलोड करें",
    recommendedCrops:"अनुशंसित फसलें", whyThese:"ये फसलें क्यों?", healthMonitor:"फसल स्वास्थ्य निगरानी", tips:"सलाह सुझाव",
  },
};

function runAnalysis(sensors, farmType, landSize, soilType, lang) {
  const { temp, humidity, soilMoisture, tankLevel, rain } = sensors;
  const alerts = [];
  let irrigDecision="", irrigColor="#16a34a", irrigUrgency=0, irrigSchedule="";
  let diseaseScore=0, diseaseColor="#16a34a", diseaseLevel="", earlyWarning="";
  let climateMsg="", climateColor="#16a34a", climateLevel="";
  let preventionTips=[];

  if (soilMoisture<30) {
    irrigUrgency=95; irrigColor="#dc2626";
    irrigDecision=lang==="te"?"తక్షణ నీటిపారుదల అవసరం! నేల చాలా పొడిగా ఉంది ("+soilMoisture+"%).":lang==="hi"?"तत्काल सिंचाई जरूरी! मिट्टी बहुत सूखी है ("+soilMoisture+"%).":"Immediate irrigation required! Soil is critically dry ("+soilMoisture+"%).";
    irrigSchedule=lang==="te"?"ఈరోజు సాయంత్రం 5-7 గంటల మధ్య నీటిపారుదల చేయండి.":lang==="hi"?"आज शाम 5-7 बजे के बीच सिंचाई करें।":"Irrigate today evening between 5-7 PM.";
    alerts.push({ level:"critical", tag:"Irrigation", msg:lang==="te"?"నేల తేమ ("+soilMoisture+"%) విమర్శనాత్మకంగా తక్కువ — తక్షణ నీటిపారుదల చేయండి!":lang==="hi"?"मिट्टी नमी ("+soilMoisture+"%) गंभीर रूप से कम — तत्काल सिंचाई!":"Soil moisture ("+soilMoisture+"%) critically low — irrigate immediately!" });
  } else if (soilMoisture<50) {
    irrigUrgency=60; irrigColor="#d97706";
    irrigDecision=lang==="te"?"నీటిపారుదల సిఫారసు. నేల తేమ అనుకూల స్థాయి కంటే తక్కువ ("+soilMoisture+"%).":lang==="hi"?"सिंचाई की सिफारिश। मिट्टी नमी ("+soilMoisture+"%) इष्टतम से कम।":"Irrigation recommended. Soil moisture below optimal ("+soilMoisture+"%).";
    irrigSchedule=lang==="te"?"రేపు తెల్లవారు లేదా సాయంత్రం నీటిపారుదల చేయండి.":lang==="hi"?"कल सुबह या शाम सिंचाई करें।":"Irrigate tomorrow morning or evening.";
    alerts.push({ level:"warning", tag:"Irrigation", msg:lang==="te"?"నేల తేమ ("+soilMoisture+"%) తక్కువ — త్వరలో నీటిపారుదల పరిశీలించండి.":lang==="hi"?"मिट्टी नमी ("+soilMoisture+"%) कम — जल्द सिंचाई पर विचार करें।":"Soil moisture ("+soilMoisture+"%) low — consider irrigating soon." });
  } else if (soilMoisture<=75) {
    irrigUrgency=10; irrigColor="#16a34a";
    irrigDecision=lang==="te"?"నేల తేమ అనుకూలంగా ఉంది ("+soilMoisture+"%). ఈరోజు నీటిపారుదల అవసరం లేదు.":lang==="hi"?"मिट्टी नमी उपयुक्त ("+soilMoisture+"%)। आज सिंचाई जरूरी नहीं।":"Soil moisture optimal ("+soilMoisture+"%). No irrigation needed today.";
    irrigSchedule=lang==="te"?"2-3 రోజుల తర్వాత సెన్సార్ తనిఖీ చేయండి.":lang==="hi"?"2-3 दिन बाद सेंसर जांचें।":"Check sensors again in 2-3 days.";
  } else {
    irrigUrgency=5; irrigColor="#0284c7";
    irrigDecision=lang==="te"?"నేల అతిగా తడిగా ఉంది ("+soilMoisture+"%). నీటిపారుదల వెంటనే ఆపండి.":lang==="hi"?"मिट्टी अत्यधिक गीली ("+soilMoisture+"%)। सिंचाई तुरंत बंद करें।":"Soil over-saturated ("+soilMoisture+"%). Stop irrigation immediately.";
    irrigSchedule=lang==="te"?"నీటిపారుదల ఆపి 3-4 రోజులు వేచి ఉండండి.":lang==="hi"?"सिंचाई बंद करें और 3-4 दिन प्रतीक्षा करें।":"Stop irrigation and wait 3-4 days.";
    alerts.push({ level:"info", tag:"Irrigation", msg:lang==="te"?"నేల అతిగా తడిగా ఉంది — నీటి సరఫరాను తగ్గించండి.":lang==="hi"?"मिट्टी अत्यधिक गीली — पानी कम करें।":"Soil over-saturated — reduce water supply." });
  }

  const landMap={"< 1 Acre":0.5,"1–5 Acres":3,"5–10 Acres":7.5,"10–25 Acres":17.5,"25–50 Acres":37.5,"50+ Acres":60};
  const acres=landMap[landSize]||5;
  const deficitFactor=Math.max(0,(70-soilMoisture)/70);
  const cropWaterMap={"Rice / Paddy":4500,"Wheat":2500,"Cotton":3000,"Vegetables":3500,"Fruits":4000,"Sugarcane":5000,"Maize / Corn":3000,"Pulses":2000,"Other":3000};
  const baseWater=cropWaterMap[farmType]||3000;
  const waterLitres=Math.round(acres*baseWater*deficitFactor);
  const waterHours=waterLitres>0?Math.round((waterLitres/1000)*0.5*10)/10:0;

  if (tankLevel<20) alerts.push({ level:"critical", tag:"Tank", msg:lang==="te"?"ట్యాంక్ స్థాయి ("+tankLevel+"%) విమర్శనాత్మకంగా తక్కువ — వెంటనే నింపండి!":lang==="hi"?"टैंक स्तर ("+tankLevel+"%) गंभीर रूप से कम — तुरंत भरें!":"Tank level ("+tankLevel+"%) critically low — refill immediately!" });
  else if (tankLevel<40) alerts.push({ level:"warning", tag:"Tank", msg:lang==="te"?"ట్యాంక్ స్థాయి ("+tankLevel+"%) తక్కువ — త్వరలో నింపండి.":lang==="hi"?"टैंक स्तर ("+tankLevel+"%) कम — जल्द भरें।":"Tank level ("+tankLevel+"%) low — plan to refill soon." });

  if (humidity>80&&temp>25) {
    diseaseScore=82; diseaseColor="#dc2626";
    diseaseLevel=lang==="te"?"అధిక ప్రమాదం":lang==="hi"?"उच्च जोखिम":"High Risk";
    earlyWarning=lang==="te"?"⚠ అధిక తేమ కొనసాగితే 3-5 రోజులలో ఫంగల్ వ్యాధి లక్షణాలు కనిపించవచ్చు.":lang==="hi"?"⚠ उच्च नमी जारी रहने पर 3-5 दिनों में फंगल लक्षण दिख सकते हैं।":"⚠ If high humidity continues, fungal symptoms may appear within 3-5 days.";
    alerts.push({ level:"critical", tag:"Disease", msg:lang==="te"?"అధిక తేమ ("+humidity+"%) + ఉష్ణోగ్రత ("+temp+"°C) — ఫంగల్ వ్యాధి ప్రమాదం అధికం!":lang==="hi"?"उच्च नमी ("+humidity+"%) + तापमान ("+temp+"°C) — फंगल रोग जोखिम उच्च!":"High humidity ("+humidity+"%) + temperature ("+temp+"°C) — fungal disease risk is high!" });
    preventionTips=[lang==="te"?"Mancozeb (2g/L) తో ప్రివెంటివ్ స్ప్రే చేయండి.":lang==="hi"?"Mancozeb (2g/L) से निवारक स्प्रे करें।":"Apply preventive spray with Mancozeb (2g/L water).",lang==="te"?"వేకువజామున నీరు పోయండి — ఆకులపై రాత్రి తేమ ఉండకుండా.":lang==="hi"?"सुबह जल्दी पानी दें — पत्तियां सूखी रहें।":"Water early morning so leaves stay dry overnight."];
  } else if (humidity>70||temp>35) {
    diseaseScore=50; diseaseColor="#d97706";
    diseaseLevel=lang==="te"?"మధ్యస్థ ప్రమాదం":lang==="hi"?"मध्यम जोखिम":"Moderate Risk";
    earlyWarning=lang==="te"?"ℹ పరిస్థితులు స్థిరంగా ఉంటే 7-10 రోజులలో వ్యాధి ప్రమాదం పెరగవచ్చు.":lang==="hi"?"ℹ परिस्थितियां स्थिर रहने पर 7-10 दिनों में जोखिम बढ़ सकता है।":"ℹ If conditions remain, disease risk may increase in 7-10 days.";
    alerts.push({ level:"warning", tag:"Disease", msg:lang==="te"?"మధ్యస్థ వ్యాధి ప్రమాదం — పంటలను జాగ్రత్తగా పర్యవేక్షించండి.":lang==="hi"?"मध्यम रोग जोखिम — फसलों की सावधानीपूर्वक निगरानी करें।":"Moderate disease risk — monitor crops carefully." });
    preventionTips=[lang==="te"?"వ్యాధి లక్షణాల కోసం ఆకులను రోజూ తనిఖీ చేయండి.":lang==="hi"?"रोज पत्तियों में रोग लक्षण जांचें।":"Check leaves daily for early disease symptoms."];
  } else {
    diseaseScore=12; diseaseColor="#16a34a";
    diseaseLevel=lang==="te"?"తక్కువ ప్రమాదం":lang==="hi"?"कम जोखिम":"Low Risk";
    earlyWarning=lang==="te"?"✅ ప్రస్తుత పరిస్థితులలో వ్యాధి ప్రమాదం తక్కువగా ఉంది.":lang==="hi"?"✅ वर्तमान परिस्थितियों में रोग जोखिम कम है।":"✅ Disease risk is low under current conditions.";
    preventionTips=[lang==="te"?"సాధారణ పర్యవేక్షణ సరిపోతుంది.":lang==="hi"?"सामान्य निगरानी पर्याप्त है।":"Regular monitoring is sufficient."];
  }

  if (temp>40) {
    climateColor="#dc2626"; climateLevel=lang==="te"?"అత్యధిక వేడి":lang==="hi"?"अत्यधिक गर्मी":"Extreme Heat";
    climateMsg=lang==="te"?"అత్యధిక వేడి ఒత్తిడి ("+temp+"°C). నీడ మరియు అదనపు నీరు తక్షణమే అందించండి.":lang==="hi"?"अत्यधिक गर्मी ("+temp+"°C)। छाया और अतिरिक्त पानी तुरंत दें।":"Extreme heat stress ("+temp+"°C). Provide shade and extra water immediately.";
    alerts.push({ level:"critical", tag:"Climate", msg:lang==="te"?"అత్యధిక ఉష్ణోగ్రత ("+temp+"°C) — తక్షణ రక్షణ అవసరం.":lang==="hi"?"अत्यधिक तापमान ("+temp+"°C) — तत्काल सुरक्षा जरूरी।":"Extreme temperature ("+temp+"°C) — crops need immediate protection." });
  } else if (temp>35) {
    climateColor="#d97706"; climateLevel=lang==="te"?"అధిక వేడి":lang==="hi"?"उच्च गर्मी":"High Heat";
    climateMsg=lang==="te"?"అధిక ఉష్ణోగ్రత ("+temp+"°C). మధ్యాహ్నం పనిని నివారించండి.":lang==="hi"?"उच्च तापमान ("+temp+"°C)। दोपहर काम से बचें।":"High temperature ("+temp+"°C). Avoid midday fieldwork.";
  } else if (temp<10) {
    climateColor="#0284c7"; climateLevel=lang==="te"?"మంచు ప్రమాదం":lang==="hi"?"पाला जोखिम":"Frost Risk";
    climateMsg=lang==="te"?"మంచు ప్రమాదం ("+temp+"°C). మొక్కలను ప్లాస్టిక్ షీట్లతో కప్పండి.":lang==="hi"?"पाला जोखिम ("+temp+"°C)। पौधों को ढकें।":"Frost risk ("+temp+"°C). Cover plants with plastic sheets.";
    alerts.push({ level:"warning", tag:"Climate", msg:lang==="te"?"మంచు ప్రమాదం — మొక్కలను కప్పండి.":lang==="hi"?"पाला जोखिम — पौधों को ढकें।":"Frost risk — cover your plants tonight." });
  } else {
    climateLevel=lang==="te"?"అనుకూలం":lang==="hi"?"अनुकूल":"Favorable";
    climateMsg=lang==="te"?"వాతావరణం అనుకూలంగా ఉంది ("+temp+"°C, "+humidity+"% తేమ). అన్ని వ్యవసాయ పనులకు మంచి రోజు.":lang==="hi"?"मौसम अनुकूल है ("+temp+"°C, "+humidity+"% नमी)। सभी कृषि कार्यों के लिए अच्छा दिन।":"Weather is favorable ("+temp+"°C, "+humidity+"% humidity). Good day for all farm activities.";
  }

  if (rain) alerts.push({ level:"info", tag:"Rain", msg:lang==="te"?"వర్షం గుర్తించబడింది — నీటిపారుదల ఆపి వర్షపు నీటిని సేకరించండి.":lang==="hi"?"वर्षा — सिंचाई बंद करें और वर्षा जल संग्रह करें।":"Rain detected — pause irrigation and harvest rainwater." });

  const ts=temp>=20&&temp<=32?100:temp>=15&&temp<=38?70:40;
  const hs=humidity>=50&&humidity<=80?100:humidity>=40&&humidity<=90?70:40;
  const ss=soilMoisture>=50&&soilMoisture<=75?100:soilMoisture>=30?70:30;
  const yieldScore=Math.round(ts*0.3+hs*0.3+ss*0.4);
  const healthScore=Math.round(ts*0.25+hs*0.25+ss*0.35+(100-diseaseScore)*0.15);
  const yieldMsg=yieldScore>75?(lang==="te"?"అనుకూల పరిస్థితులు — మంచి దిగుబడి ఆశించవచ్చు.":lang==="hi"?"अनुकूल परिस्थितियां — अच्छी फसल की उम्मीद।":"Favorable conditions — good harvest yield expected."):yieldScore>50?(lang==="te"?"సగటు దిగుబడి అంచనా. నేల తేమ మెరుగుపరచండి.":lang==="hi"?"औसत उत्पादन अनुमान। मिट्टी नमी सुधारें।":"Average yield forecast. Improve soil moisture."):(lang==="te"?"తక్కువ దిగుబడి. సెన్సార్ స్థాయిలు వెంటనే మెరుగుపరచండి.":lang==="hi"?"कम उत्पादन। सेंसर स्तर तुरंत सुधारें।":"Low yield. Improve sensor conditions immediately.");

  const envItems=[
    {label:lang==="te"?"ఉష్ణోగ్రత స్థితి":lang==="hi"?"तापमान स्थिति":"Temperature Status",val:temp>38||temp<10?"Critical":temp>32?"High":"Optimal",color:temp>38||temp<10?"#dc2626":temp>32?"#d97706":"#16a34a"},
    {label:lang==="te"?"తేమ స్థితి":lang==="hi"?"नमी स्थिति":"Humidity Status",val:humidity>85?"Too High":humidity>70?"Moderate":"Optimal",color:humidity>85?"#dc2626":humidity>70?"#d97706":"#16a34a"},
    {label:lang==="te"?"నేల స్థితి":lang==="hi"?"मिट्टी स्थिति":"Soil Status",val:soilMoisture<30?"Dry":soilMoisture>80?"Wet":"Optimal",color:soilMoisture<30?"#dc2626":soilMoisture>80?"#0284c7":"#16a34a"},
    {label:lang==="te"?"నీటి లభ్యత":lang==="hi"?"जल उपलब्धता":"Water Availability",val:tankLevel<20?"Critical":tankLevel<40?"Low":"Good",color:tankLevel<20?"#dc2626":tankLevel<40?"#d97706":"#16a34a"},
  ];

  let recCrops=[], cropReason="";
  if (temp>=20&&temp<=35&&humidity>=60){recCrops=lang==="te"?["వరి","చెరకు","అరటి","కూరగాయలు"]:lang==="hi"?["धान","गन्ना","केला","सब्जियां"]:["Rice","Sugarcane","Banana","Vegetables"];cropReason=lang==="te"?"అధిక తేమ మరియు మధ్యస్థ ఉష్ణోగ్రత ఈ పంటలకు అనుకూలంగా ఉన్నాయి.":lang==="hi"?"उच्च नमी और मध्यम तापमान इन फसलों के लिए अनुकूल हैं।":"High humidity and moderate temperature are ideal for these crops.";}
  else if (temp>=15&&temp<=30&&humidity<60){recCrops=lang==="te"?["గోధుమ","శనగ","పత్తి","పప్పులు"]:lang==="hi"?["गेहूं","चना","कपास","दालें"]:["Wheat","Chickpea","Cotton","Pulses"];cropReason=lang==="te"?"తక్కువ తేమ మరియు చల్లని ఉష్ణోగ్రత ఈ పంటలకు సరిగ్గా సరిపోతాయి.":lang==="hi"?"कम नमी और ठंडा तापमान इन फसलों के लिए बेहतर है।":"Lower humidity and cooler temperatures suit these crops well.";}
  else if (temp>30){recCrops=lang==="te"?["మొక్కజొన్న","కంది","జొన్న","నువ్వులు"]:lang==="hi"?["मक्का","अरहर","ज्वार","तिल"]:["Maize","Pigeon Pea","Sorghum","Sesame"];cropReason=lang==="te"?"అధిక ఉష్ణోగ్రత పరిస్థితులలో ఈ పంటలు మంచి దిగుబడి ఇస్తాయి.":lang==="hi"?"उच्च तापमान में ये फसलें अच्छा उत्पादन देती हैं।":"These crops perform well under high temperature conditions.";}
  else{recCrops=lang==="te"?["కూరగాయలు","ఆకుకూరలు","టమాటో","బంగాళాదుంప"]:lang==="hi"?["सब्जियां","पत्तेदार साग","टमाटर","आलू"]:["Vegetables","Leafy Greens","Tomato","Potato"];cropReason=lang==="te"?"ప్రస్తుత పరిస్థితులు కూరగాయలకు అనుకూలంగా ఉన్నాయి.":lang==="hi"?"वर्तमान परिस्थितियां सब्जियों के लिए अनुकूल हैं।":"Current conditions are favorable for vegetables.";}

  const tips=[];
  if (soilMoisture<40) tips.push(lang==="te"?"ఈరోజు సాయంత్రం నీటిపారుదల చేయండి.":lang==="hi"?"आज शाम सिंचाई करें।":"Irrigate this evening.");
  if (humidity>75) tips.push(lang==="te"?"ఫంగల్ లక్షణాల కోసం ఆకులను తనిఖీ చేయండి.":lang==="hi"?"फंगल लक्षण के लिए पत्तियां जांचें।":"Check leaves for fungal symptoms.");
  if (temp>32) tips.push(lang==="te"?"మధ్యాహ్నం పని నివారించండి.":lang==="hi"?"दोपहर काम से बचें।":"Avoid midday fieldwork.");
  if (tankLevel<40) tips.push(lang==="te"?"నీటి ట్యాంక్ నింపండి.":lang==="hi"?"पानी टैंक भरें।":"Refill water tank.");
  if (tips.length===0) tips.push(lang==="te"?"అన్ని పరిస్థితులు అనుకూలంగా ఉన్నాయి!":lang==="hi"?"सभी स्थितियां अनुकूल हैं!":"All conditions are favorable!");

  return {alerts,irrigDecision,irrigColor,irrigUrgency,irrigSchedule,waterLitres,waterHours,acres,diseaseScore,diseaseColor,diseaseLevel,earlyWarning,preventionTips,climateMsg,climateColor,climateLevel,yieldScore,healthScore,yieldMsg,envItems,recCrops,cropReason,tips};
}

function Ring({value,color,size=76}){
  const r=size/2-7,circ=2*Math.PI*r,dash=(value/100)*circ;
  return(
    <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#d1fae5" strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 1s ease"}}/>
      </svg>
      <span style={{position:"absolute",fontFamily:"'DM Sans'",fontWeight:700,fontSize:size>70?15:12,color}}>{value}%</span>
    </div>
  );
}

export default function Home(){
  const navigate=useNavigate();
  const {lang}=useLang();
  const t=TR[lang]||TR.en;
  const userName=localStorage.getItem("userName")||"Farmer";
  const farmName=localStorage.getItem("farmName")||"";
  const farmType=localStorage.getItem("farmType")||"Other";
  const landSize=localStorage.getItem("landSize")||"5–10 Acres";
  const soilType=localStorage.getItem("soilType")||"";
  const irrigationType=localStorage.getItem("irrigationType")||"";

  const [page,setPage]=useState("dashboard");
  const [scrolled,setScrolled]=useState(false);
  const [showLogout,setShowLogout]=useState(false);
  const [saving,setSaving]=useState(false);
  const [savedTime,setSavedTime]=useState(null);
  const [time,setTime]=useState(new Date());
  const [sensors,setSensors]=useState({temp:28,humidity:65,soilMoisture:55,tankLevel:70,rain:false});
  const [insights,setInsights]=useState(()=>runAnalysis({temp:28,humidity:65,soilMoisture:55,tankLevel:70,rain:false},farmType,landSize,soilType,lang));
  const [photoFile,setPhotoFile]=useState(null);
  const [photoPreview,setPhotoPreview]=useState(null);
  const [diagnosing,setDiagnosing]=useState(false);
  const [diagnosis,setDiagnosis]=useState(null);
  const [diagError,setDiagError]=useState("");
  const fileRef=useRef();

  useEffect(()=>{setInsights(runAnalysis(sensors,farmType,landSize,soilType,lang));},[lang]);
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>30);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  useEffect(()=>{const id=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(id);},[]);

  const handleSave=()=>{setSaving(true);setTimeout(()=>{setInsights(runAnalysis(sensors,farmType,landSize,soilType,lang));setSavedTime(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));setSaving(false);},1200);};
  const handleLogout=()=>{localStorage.clear();navigate("/signup");};

  const handlePhotoChange=(e)=>{
    const file=e.target.files?.[0];if(!file)return;
    setPhotoFile(file);setDiagnosis(null);setDiagError("");
    const r=new FileReader();r.onload=ev=>setPhotoPreview(ev.target.result);r.readAsDataURL(file);
  };

  const handleDiagnose=async()=>{
    if(!photoFile){setDiagError(t.noPhoto);return;}
    setDiagnosing(true);setDiagnosis(null);setDiagError("");
    try{
      const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=()=>rej(new Error("Read failed"));r.readAsDataURL(photoFile);});
      const mediaType=photoFile.type||"image/jpeg";
      const cropCtx=`Farmer crop: ${farmType}, Soil: ${soilType||"Unknown"}, Irrigation: ${irrigationType||"Unknown"}, Temperature: ${sensors.temp}°C, Humidity: ${sensors.humidity}%, Soil moisture: ${sensors.soilMoisture}%`;
      const prompt=`You are an expert agricultural plant pathologist AI. Analyze this crop photo and give a detailed disease diagnosis.\n\n${cropCtx}\n\nRespond ONLY in JSON:\n{"diseaseName":"...","confidence":"High/Medium/Low","severity":"None/Mild/Moderate/Severe","symptoms":["..."],"cause":"...","prevention":["..."],"treatment":["..."],"urgency":"Immediate/Within 3 days/Within a week/No action needed","affectedArea":"..."}\n\nUse ${lang==="te"?"Telugu":lang==="hi"?"Hindi":"English"} for all text values. Return ONLY the JSON.`;
      const response=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mediaType,data:base64}},{type:"text",text:prompt}]}]})});
      const data=await response.json();
      const raw=data.content?.[0]?.text||"";
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      setDiagnosis(parsed);
    }catch(err){
      setDiagError(lang==="te"?"విశ్లేషణ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.":lang==="hi"?"विश्लेषण विफल हुआ। पुनः प्रयास करें।":"Analysis failed. Try again with a clearer photo.");
    }finally{setDiagnosing(false);}
  };

  const sColor=v=>v>70?"#16a34a":v>40?"#d97706":"#dc2626";
  const aBg=l=>l==="critical"?"#fef2f2":l==="warning"?"#fffbeb":l==="info"?"#eff6ff":"#f0fdf4";
  const aBdr=l=>l==="critical"?"#fca5a5":l==="warning"?"#fcd34d":l==="info"?"#93c5fd":"#86efac";
  const aTxt=l=>l==="critical"?"#991b1b":l==="warning"?"#92400e":l==="info"?"#1e40af":"#166534";
  const aTag=l=>l==="critical"?"Critical":l==="warning"?"Warning":l==="info"?"Info":"Notice";
  const history=[62,58,55,70,68,65,sensors.soilMoisture];
  const maxH=Math.max(...history);
  const navItems=["dashboard","sensors","analysis","irrigation","disease","crops","alerts"];

  const Card=({children,style={}})=><div style={{background:"white",border:"1px solid #d1fae5",borderRadius:16,padding:"22px",boxShadow:"0 2px 10px rgba(34,197,94,0.06)",...style}}>{children}</div>;
  const SectionHead=({title,sub})=><div style={{marginBottom:20}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#14532d",marginBottom:4}}>{title}</h2><p style={{fontSize:13,color:"#6aaa6a"}}>{sub}</p></div>;
  const InfoBlock=({title,color,score,scoreLabel,msg,tag})=>(
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#14532d",flex:1}}>{title}</p>
        {score!==undefined&&<div style={{textAlign:"center",flexShrink:0,marginLeft:10}}><Ring value={score} color={color} size={60}/>{scoreLabel&&<p style={{fontSize:9,color:"#9ca3af",marginTop:1,textTransform:"uppercase"}}>{scoreLabel}</p>}</div>}
        {tag&&<span style={{fontSize:11,fontWeight:700,color,background:`${color}15`,border:`1px solid ${color}40`,borderRadius:100,padding:"3px 10px",marginLeft:10,flexShrink:0}}>{tag}</span>}
      </div>
      <div style={{background:`${color}10`,border:`1.5px solid ${color}30`,borderRadius:10,padding:"12px 14px"}}>
        <p style={{fontSize:13,color:"#374151",lineHeight:1.7}}>{msg}</p>
      </div>
    </Card>
  );

  // ── DASHBOARD
  const PageDashboard=()=>(
    <div>
      <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1px solid #bbf7d0",borderRadius:18,padding:"24px 28px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
        <div>
          <p style={{fontSize:12,color:"#6aaa6a",fontWeight:500,marginBottom:2}}>{t.dashSub}</p>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#14532d",marginBottom:4}}>{userName.split(" ")[0]} 👋</h1>
          <p style={{fontSize:13,color:"#4b7a4b"}}>{farmName&&<span>🏡 {farmName} · </span>}🌾 {farmType} · 📐 {landSize}</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[{label:"Temp",val:`${sensors.temp}°C`,c:sensors.temp>38?"#dc2626":sensors.temp>32?"#d97706":"#16a34a"},{label:"Humidity",val:`${sensors.humidity}%`,c:sensors.humidity>80?"#d97706":"#16a34a"},{label:"Soil",val:`${sensors.soilMoisture}%`,c:sensors.soilMoisture<30?"#dc2626":sensors.soilMoisture<50?"#d97706":"#16a34a"},{label:"Tank",val:`${sensors.tankLevel}%`,c:sensors.tankLevel<20?"#dc2626":sensors.tankLevel<40?"#d97706":"#0284c7"}].map((s,i)=>(
            <div key={i} style={{background:"white",border:"1px solid #d1fae5",borderRadius:12,padding:"9px 14px",textAlign:"center",minWidth:68}}>
              <div style={{fontWeight:700,fontSize:17,color:s.c}}>{s.val}</div>
              <div style={{fontSize:10,color:"#6aaa6a",marginTop:2,textTransform:"uppercase",letterSpacing:"0.5px"}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))",gap:12,marginBottom:18}}>
        {[
          {title:t.cropHealth,val:insights.healthScore,color:sColor(insights.healthScore),note:insights.healthScore>70?(lang==="te"?"ఆరోగ్యకరం":lang==="hi"?"स्वस्थ":"Healthy"):(lang==="te"?"దృష్టి అవసరం":lang==="hi"?"ध्यान जरूरी":"Needs attention"),page:"crops"},
          {title:t.yieldScore,val:insights.yieldScore,color:sColor(insights.yieldScore),note:insights.yieldScore>70?(lang==="te"?"మంచి అంచనా":lang==="hi"?"अच्छा अनुमान":"Good forecast"):(lang==="te"?"మెరుగుపరచండి":lang==="hi"?"सुधारें":"Improve"),page:"analysis"},
          {title:t.diseaseRisk,val:insights.diseaseScore,color:insights.diseaseColor,note:insights.diseaseLevel,page:"disease"},
          {title:t.irrigNeed,val:insights.irrigUrgency,color:insights.irrigColor,note:insights.irrigUrgency<20?(lang==="te"?"అవసరం లేదు":lang==="hi"?"जरूरत नहीं":"Not needed"):(lang==="te"?"అవసరం":lang==="hi"?"जरूरी":"Required"),page:"irrigation"},
        ].map((c,i)=>(
          <div key={i} onClick={()=>setPage(c.page)} style={{background:"white",border:"1px solid #d1fae5",borderRadius:16,padding:"18px",boxShadow:"0 2px 10px rgba(34,197,94,0.06)",cursor:"pointer",transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 24px rgba(34,197,94,0.15)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 10px rgba(34,197,94,0.06)"}>
            <p style={{fontSize:10,color:"#6aaa6a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>{c.title}</p>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Ring value={c.val} color={c.color} size={66}/>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,color:"#14532d",lineHeight:1.3}}>{c.note}</div>
            </div>
            <p style={{fontSize:11,color:"#16a34a",marginTop:8,fontWeight:500}}>View details →</p>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#14532d"}}>Active Alerts</p>
            {insights.alerts.length>0&&<span onClick={()=>setPage("alerts")} style={{fontSize:12,color:"#16a34a",cursor:"pointer",fontWeight:600,textDecoration:"underline"}}>View all</span>}
          </div>
          {insights.alerts.length===0?<p style={{fontSize:13,color:"#6aaa6a"}}>{lang==="te"?"హెచ్చరికలు లేవు.":lang==="hi"?"कोई अलर्ट नहीं।":"No active alerts. Farm is healthy."}</p>
            :insights.alerts.slice(0,3).map((a,i)=>(
              <div key={i} style={{padding:"8px 12px",background:aBg(a.level),border:`1px solid ${aBdr(a.level)}`,borderRadius:10,marginBottom:6}}>
                <span style={{fontSize:9,fontWeight:700,color:aTxt(a.level),textTransform:"uppercase"}}>{aTag(a.level)} · {a.tag}</span>
                <p style={{fontSize:12,color:"#374151",marginTop:2,lineHeight:1.5}}>{a.msg}</p>
              </div>
            ))}
        </Card>
        <Card>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#14532d",marginBottom:12}}>Today's Advisory</p>
          {insights.tips.map((tip,i)=>(
            <div key={i} style={{padding:"8px 12px",background:"#f0fdf4",border:"1px solid #d1fae5",borderRadius:10,marginBottom:6}}>
              <p style={{fontSize:13,color:"#374151",lineHeight:1.5}}>{tip}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  // ── SENSORS
  const PageSensors=()=>(
    <div>
      <SectionHead title={lang==="te"?"సెన్సార్ డేటా ఏకీకరణ":lang==="hi"?"सेंसर डेटा एकीकरण":"Sensor Data Integration & Processing"} sub={lang==="te"?"మీ హార్డ్‌వేర్ సెన్సార్ విలువలను నమోదు చేయండి — ఇవి అన్ని 15 ఫీచర్లను నడిపిస్తాయి.":lang==="hi"?"अपने हार्डवेयर सेंसर मान दर्ज करें — ये सभी 15 फीचर चलाते हैं।":"Enter your hardware sensor values — these power all 15 system features."}/>
      <Card style={{marginBottom:20}}>
        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",marginBottom:18,display:"flex",gap:16,flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"#6aaa6a",fontWeight:500}}>🌾 {lang==="te"?"మీ పంట":lang==="hi"?"आपकी फसल":"Your crop"}: <strong style={{color:"#14532d"}}>{farmType}</strong></span>
          <span style={{fontSize:12,color:"#6aaa6a",fontWeight:500}}>📐 {lang==="te"?"భూమి":lang==="hi"?"जमीन":"Land"}: <strong style={{color:"#14532d"}}>{landSize}</strong></span>
          {soilType&&<span style={{fontSize:12,color:"#6aaa6a",fontWeight:500}}>🌍 {lang==="te"?"నేల":lang==="hi"?"मिट्टी":"Soil"}: <strong style={{color:"#14532d"}}>{soilType}</strong></span>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:18,marginBottom:20}}>
          {[{key:"temp",label:t.temp,max:60,bar:v=>v>38?"#ef4444":v>32?"#f97316":"#22c55e"},{key:"humidity",label:t.humidity,max:100,bar:v=>v>80?"#f97316":"#22c55e"},{key:"soilMoisture",label:t.soilMoisture,max:100,bar:v=>v<30?"#ef4444":v<50?"#f97316":"#22c55e"},{key:"tankLevel",label:t.tankLevel,max:100,bar:v=>v<20?"#ef4444":v<40?"#f97316":"#0ea5e9"}].map(f=>(
            <div key={f.key}>
              <label style={{fontSize:11,fontWeight:600,color:"#6aaa6a",textTransform:"uppercase",letterSpacing:"0.8px",display:"block",marginBottom:7}}>{f.label}</label>
              <input type="number" min={0} max={f.max} value={sensors[f.key]} onChange={e=>setSensors(s=>({...s,[f.key]:Number(e.target.value)}))}
                style={{width:"100%",border:"1.5px solid #bbf7d0",borderRadius:10,padding:"10px 14px",fontSize:22,fontWeight:700,color:"#14532d",outline:"none",background:"#f0fdf4",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}
                onFocus={e=>{e.target.style.borderColor="#22c55e";e.target.style.background="#fff";e.target.style.boxShadow="0 0 0 3px rgba(34,197,94,0.1)";}}
                onBlur={e=>{e.target.style.borderColor="#bbf7d0";e.target.style.background="#f0fdf4";e.target.style.boxShadow="none";}}/>
              <div style={{marginTop:7,height:5,background:"#d1fae5",borderRadius:5,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(sensors[f.key]/f.max)*100}%`,background:f.bar(sensors[f.key]),borderRadius:5,transition:"all 0.4s"}}/>
              </div>
            </div>
          ))}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:"#6aaa6a",textTransform:"uppercase",letterSpacing:"0.8px",display:"block",marginBottom:7}}>{t.rain}</label>
            <div onClick={()=>setSensors(s=>({...s,rain:!s.rain}))} style={{display:"flex",alignItems:"center",gap:12,padding:"13px",background:sensors.rain?"#eff6ff":"#f0fdf4",border:`1.5px solid ${sensors.rain?"#93c5fd":"#bbf7d0"}`,borderRadius:10,cursor:"pointer",transition:"all 0.2s"}}>
              <div style={{width:44,height:24,borderRadius:12,background:sensors.rain?"#3b82f6":"#d1fae5",position:"relative",transition:"all 0.3s",flexShrink:0}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:"white",position:"absolute",top:2,left:sensors.rain?22:2,transition:"left 0.3s",boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}/>
              </div>
              <span style={{fontWeight:700,fontSize:16,color:sensors.rain?"#1d4ed8":"#6aaa6a"}}>{sensors.rain?t.yes:t.no}</span>
            </div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} style={{width:"100%",background:saving?"#86efac":"linear-gradient(135deg,#22c55e,#16a34a)",color:"white",border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:700,cursor:saving?"not-allowed":"pointer",transition:"all 0.25s",fontFamily:"'DM Sans',sans-serif"}}>
          {saving?<Sp text={t.saving}/>:t.saveBtn}
        </button>
        {savedTime&&<p style={{textAlign:"center",fontSize:12,color:"#16a34a",marginTop:8,fontWeight:500}}>✓ {t.savedAt} {savedTime}</p>}
      </Card>
      <Card>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#14532d",marginBottom:16}}>{t.history}</p>
        <div style={{display:"flex",alignItems:"flex-end",gap:10,height:90}}>
          {history.map((v,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
              <span style={{fontSize:10,fontWeight:700,color:i===6?"#16a34a":"#9ca3af"}}>{v}%</span>
              <div style={{width:"100%",borderRadius:"5px 5px 0 0",background:i===6?"#22c55e":"#bbf7d0",height:`${(v/maxH)*76}px`,transition:"height 0.8s ease"}}/>
              <span style={{fontSize:10,color:"#9ca3af",fontWeight:500}}>{"MTWTFST"[i]}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:11,color:"#9ca3af",marginTop:8}}>{lang==="te"?"నేల తేమ % — గత 7 రోజులు":lang==="hi"?"मिट्टी नमी % — पिछले 7 दिन":"Soil Moisture % — past 7 days"}</p>
      </Card>
    </div>
  );

  // ── ANALYSIS
  const PageAnalysis=()=>(
    <div>
      <SectionHead title={t.analysisTitle} sub={t.analysisSub}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:16}}>
        {insights.envItems.map((e,i)=>(
          <div key={i} style={{background:"white",border:"1px solid #d1fae5",borderRadius:12,padding:"13px",textAlign:"center",boxShadow:"0 2px 8px rgba(34,197,94,0.05)"}}>
            <div style={{fontWeight:700,fontSize:15,color:e.color,marginBottom:3}}>{e.val}</div>
            <div style={{fontSize:10,color:"#6aaa6a",textTransform:"uppercase",letterSpacing:"0.5px"}}>{e.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <InfoBlock title={lang==="te"?"దిగుబడి అంచనా":lang==="hi"?"उत्पादन पूर्वानुमान":"Yield Prediction"} color={sColor(insights.yieldScore)} score={insights.yieldScore} scoreLabel={lang==="te"?"దిగుబడి స్కోర్":lang==="hi"?"उत्पादन स्कोर":"Yield Score"} msg={insights.yieldMsg}/>
        <InfoBlock title={lang==="te"?"వాతావరణ ప్రమాదం":lang==="hi"?"जलवायु जोखिम":"Climate Risk"} color={insights.climateColor} tag={insights.climateLevel} msg={insights.climateMsg}/>
      </div>
      <InfoBlock title={lang==="te"?"వ్యాధి ప్రమాద విశ్లేషణ":lang==="hi"?"रोग जोखिम विश्लेषण":"Disease Risk Analysis (Sensor-Based)"} color={insights.diseaseColor} score={insights.diseaseScore} scoreLabel={insights.diseaseLevel} msg={insights.earlyWarning}/>
    </div>
  );

  // ── IRRIGATION
  const PageIrrigation=()=>(
    <div>
      <SectionHead title={t.irrigTitle} sub={t.irrigSub}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <InfoBlock title={t.irrigDecision} color={insights.irrigColor} score={insights.irrigUrgency} scoreLabel={lang==="te"?"అవసరం స్కోర్":lang==="hi"?"जरूरत स्कोर":"Urgency"} msg={insights.irrigDecision}/>
        <Card>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#14532d",marginBottom:12}}>{t.waterReq}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
            {[
              {label:lang==="te"?"పొలం పరిమాణం":lang==="hi"?"खेत का आकार":"Farm Size",val:`${insights.acres} acres`},
              {label:lang==="te"?"నీటి అవసరం":lang==="hi"?"पानी की जरूरत":"Water Required",val:insights.waterLitres>0?`${insights.waterLitres.toLocaleString()} L`:(lang==="te"?"అవసరం లేదు":lang==="hi"?"जरूरत नहीं":"Not needed")},
              {label:lang==="te"?"సమయం":lang==="hi"?"समय":"Time Needed",val:insights.waterHours>0?`~${insights.waterHours} hrs`:"0 hrs"},
              {label:lang==="te"?"పంట":lang==="hi"?"फसल":"Crop",val:farmType},
            ].map((s,i)=>(
              <div key={i} style={{background:"#f0fdf4",border:"1px solid #d1fae5",borderRadius:9,padding:"9px 12px"}}>
                <div style={{fontSize:10,color:"#6aaa6a",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>{s.label}</div>
                <div style={{fontWeight:700,fontSize:14,color:"#14532d"}}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{background:"#f0fdf4",border:"1px solid #d1fae5",borderRadius:9,padding:"9px 12px",fontSize:11,color:"#6aaa6a",lineHeight:1.6}}>
            {lang==="te"?"నీటి అవసరం నేల తేమ లోటు మరియు పంట రకం ఆధారంగా లెక్కించబడింది.":lang==="hi"?"पानी की जरूरत मिट्टी नमी की कमी और फसल प्रकार के आधार पर गणना।":"Calculated based on soil moisture deficit and crop water requirements."}
          </div>
        </Card>
      </div>
      <Card>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#14532d",marginBottom:10}}>{t.irrigSchedule}</p>
        <div style={{background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10,padding:"13px 16px"}}>
          <p style={{fontSize:14,color:"#374151",lineHeight:1.7}}>{insights.irrigSchedule}</p>
        </div>
      </Card>
    </div>
  );

  // ── DISEASE
  const PageDisease=()=>(
    <div>
      <SectionHead title={t.diseaseTitle} sub={t.diseaseSub}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <InfoBlock title={lang==="te"?"సెన్సార్ ఆధారిత వ్యాధి ప్రమాదం":lang==="hi"?"सेंसर आधारित रोग जोखिम":"Sensor-Based Disease Risk"} color={insights.diseaseColor} score={insights.diseaseScore} scoreLabel={insights.diseaseLevel} msg={insights.earlyWarning}/>
        <Card>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#14532d",marginBottom:12}}>{lang==="te"?"నివారణ సలహా":lang==="hi"?"रोकथाम सलाह":"Prevention Advisory"}</p>
          {insights.preventionTips.map((tip,i)=>(
            <div key={i} style={{padding:"9px 12px",background:"#f0fdf4",border:"1px solid #d1fae5",borderRadius:9,marginBottom:7}}>
              <p style={{fontSize:13,color:"#374151",lineHeight:1.55}}>{tip}</p>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#14532d",marginBottom:4}}>{t.uploadPhoto}</p>
        <p style={{fontSize:12,color:"#6aaa6a",marginBottom:16}}>{t.photoHint} · {lang==="te"?"పంట":lang==="hi"?"फसल":"Crop"}: <strong style={{color:"#14532d"}}>{farmType}</strong></p>
        <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${photoPreview?"#22c55e":"#bbf7d0"}`,borderRadius:14,padding:"26px",textAlign:"center",cursor:"pointer",background:photoPreview?"#f0fdf4":"#fafffe",transition:"all 0.2s",marginBottom:14}}
          onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor="#22c55e";}}
          onDragLeave={e=>{e.currentTarget.style.borderColor=photoPreview?"#22c55e":"#bbf7d0";}}
          onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f){setPhotoFile(f);setDiagnosis(null);setDiagError("");const r=new FileReader();r.onload=ev=>setPhotoPreview(ev.target.result);r.readAsDataURL(f);}}}>
          {photoPreview?<img src={photoPreview} alt="crop" style={{maxHeight:180,maxWidth:"100%",borderRadius:10,objectFit:"cover"}}/>
            :<><div style={{fontSize:36,marginBottom:8}}>📷</div><p style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#14532d",marginBottom:4}}>{t.dragDrop}</p><p style={{fontSize:12,color:"#6aaa6a"}}>JPG, PNG, WEBP</p></>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoChange}/>
        {photoPreview&&(
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <button onClick={handleDiagnose} disabled={diagnosing} style={{flex:2,background:diagnosing?"#86efac":"linear-gradient(135deg,#22c55e,#16a34a)",color:"white",border:"none",borderRadius:11,padding:"12px",fontSize:14,fontWeight:700,cursor:diagnosing?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {diagnosing?<Sp text={t.analyzing}/>:`🔬 ${t.analyzePhoto}`}
            </button>
            <button onClick={()=>{setPhotoFile(null);setPhotoPreview(null);setDiagnosis(null);setDiagError("");}} style={{flex:1,background:"#fef2f2",border:"1.5px solid #fca5a5",color:"#dc2626",borderRadius:11,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {lang==="te"?"తీసివేయి":lang==="hi"?"हटाएं":"Remove"}
            </button>
          </div>
        )}
        {diagError&&<div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:10,padding:"11px 14px",marginBottom:12,fontSize:13,color:"#dc2626"}}>⚠ {diagError}</div>}
        {diagnosis&&(
          <div style={{background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:16,padding:"20px"}}>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#14532d",marginBottom:14}}>{t.diseaseResult}</p>
            <div style={{display:"flex",gap:9,marginBottom:14,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:150,background:"white",border:"1px solid #d1fae5",borderRadius:11,padding:"12px"}}>
                <div style={{fontSize:10,color:"#6aaa6a",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:3}}>{lang==="te"?"వ్యాధి పేరు":lang==="hi"?"रोग नाम":"Disease Name"}</div>
                <div style={{fontWeight:700,fontSize:15,color:"#14532d"}}>{diagnosis.diseaseName}</div>
              </div>
              {[{label:lang==="te"?"నమ్మకం":lang==="hi"?"विश्वास":"Confidence",val:diagnosis.confidence,color:diagnosis.confidence==="High"?"#16a34a":diagnosis.confidence==="Medium"?"#d97706":"#6b7280"},{label:lang==="te"?"తీవ్రత":lang==="hi"?"गंभीरता":"Severity",val:diagnosis.severity,color:diagnosis.severity==="Severe"?"#dc2626":diagnosis.severity==="Moderate"?"#d97706":diagnosis.severity==="Mild"?"#eab308":"#16a34a"},{label:lang==="te"?"అత్యవసరత":lang==="hi"?"तात्कालिकता":"Urgency",val:diagnosis.urgency?.split(" ").slice(0,2).join(" "),color:diagnosis.urgency?.startsWith("Imm")?"#dc2626":"#d97706"}].map((s,i)=>(
                <div key={i} style={{background:"white",border:"1px solid #d1fae5",borderRadius:11,padding:"12px",textAlign:"center",minWidth:80}}>
                  <div style={{fontSize:10,color:"#6aaa6a",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>{s.label}</div>
                  <div style={{fontWeight:700,fontSize:13,color:s.color}}>{s.val}</div>
                </div>
              ))}
            </div>
            {diagnosis.cause&&<div style={{background:"white",border:"1px solid #d1fae5",borderRadius:10,padding:"11px 14px",marginBottom:12}}><div style={{fontSize:10,color:"#6aaa6a",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:3}}>{lang==="te"?"కారణం":lang==="hi"?"कारण":"Cause"}</div><p style={{fontSize:13,color:"#374151",lineHeight:1.6}}>{diagnosis.cause}</p></div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[{title:lang==="te"?"లక్షణాలు":lang==="hi"?"लक्षण":"Symptoms",items:diagnosis.symptoms,color:"#d97706",bg:"#fffbeb",bdr:"#fcd34d"},{title:lang==="te"?"నివారణ":lang==="hi"?"रोकथाम":"Prevention",items:diagnosis.prevention,color:"#16a34a",bg:"#f0fdf4",bdr:"#bbf7d0"},{title:lang==="te"?"చికిత్స":lang==="hi"?"उपचार":"Treatment",items:diagnosis.treatment,color:"#0284c7",bg:"#eff6ff",bdr:"#93c5fd"}].map((sec,i)=>(
                <div key={i} style={{background:sec.bg,border:`1px solid ${sec.bdr}`,borderRadius:11,padding:"13px"}}>
                  <p style={{fontWeight:700,fontSize:11,color:sec.color,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:8}}>{sec.title}</p>
                  {(sec.items||[]).map((item,j)=>(
                    <div key={j} style={{display:"flex",gap:6,marginBottom:6,alignItems:"flex-start"}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:sec.color,marginTop:5,flexShrink:0}}/>
                      <p style={{fontSize:12,color:"#374151",lineHeight:1.55}}>{item}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  // ── CROPS
  const PageCrops=()=>(
    <div>
      <SectionHead title={t.cropTitle} sub={t.cropSub}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#14532d",marginBottom:12}}>{t.recommendedCrops}</p>
          {insights.recCrops.map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:11,marginBottom:7}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",flexShrink:0}}/>
              <span style={{fontWeight:600,fontSize:14,color:"#14532d"}}>{c}</span>
              {c.toLowerCase().includes(farmType.split(" ")[0].toLowerCase())&&<span style={{marginLeft:"auto",fontSize:10,background:"#dcfce7",color:"#16a34a",padding:"2px 8px",borderRadius:100,fontWeight:600}}>{lang==="te"?"మీ పంట":lang==="hi"?"आपकी फसल":"Your crop"}</span>}
            </div>
          ))}
          <div style={{background:"#f0fdf4",border:"1px solid #d1fae5",borderRadius:9,padding:"9px 12px",marginTop:9,fontSize:12,color:"#6aaa6a",lineHeight:1.6}}>{insights.cropReason}</div>
        </Card>
        <Card>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#14532d",marginBottom:14}}>{t.healthMonitor}</p>
          <div style={{textAlign:"center",marginBottom:14}}><Ring value={insights.healthScore} color={sColor(insights.healthScore)} size={86}/><p style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#14532d",marginTop:8}}>{insights.healthScore>70?(lang==="te"?"పంట ఆరోగ్యకరంగా ఉంది":lang==="hi"?"फसल स्वस्थ है":"Crop is Healthy"):insights.healthScore>40?(lang==="te"?"మధ్యస్థ ఆరోగ్యం":lang==="hi"?"मध्यम स्वास्थ्य":"Moderate Health"):(lang==="te"?"దృష్టి అవసరం":lang==="hi"?"ध्यान जरूरी":"Needs Attention")}</p></div>
          {[{label:lang==="te"?"ఉష్ణోగ్రత అనుకూలత":lang==="hi"?"तापमान अनुकूलता":"Temperature Suitability",val:sensors.temp>=20&&sensors.temp<=35?100:sensors.temp>=15&&sensors.temp<=38?65:30},{label:lang==="te"?"తేమ అనుకూలత":lang==="hi"?"नमी अनुकूलता":"Humidity Suitability",val:sensors.humidity>=50&&sensors.humidity<=80?100:sensors.humidity>=40&&sensors.humidity<=90?65:30},{label:lang==="te"?"నేల అనుకూలత":lang==="hi"?"मिट्टी अनुकूलता":"Soil Suitability",val:sensors.soilMoisture>=50&&sensors.soilMoisture<=75?100:sensors.soilMoisture>=30?65:25}].map((b,i)=>(
            <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:"#6aaa6a"}}>{b.label}</span><span style={{fontSize:12,fontWeight:700,color:sColor(b.val)}}>{b.val}%</span></div>
              <div style={{height:6,background:"#d1fae5",borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:`${b.val}%`,background:sColor(b.val),borderRadius:6,transition:"width 0.8s ease"}}/></div>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#14532d",marginBottom:12}}>{t.tips}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:9}}>
          {insights.tips.map((tip,i)=><div key={i} style={{padding:"10px 13px",background:"#f0fdf4",border:"1px solid #d1fae5",borderRadius:11}}><p style={{fontSize:13,color:"#374151",lineHeight:1.55}}>{tip}</p></div>)}
        </div>
      </Card>
    </div>
  );

  // ── ALERTS
  const PageAlerts=()=>(
    <div>
      <SectionHead title={t.alertsTitle} sub={t.alertsSub}/>
      {insights.alerts.length===0
        ?<div style={{textAlign:"center",padding:"56px 20px",background:"white",borderRadius:18,border:"1px solid #d1fae5"}}>
          <p style={{fontSize:34,marginBottom:10}}>🌱</p>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:"#14532d",marginBottom:5}}>{lang==="te"?"అన్ని వ్యవస్థలు సాధారణంగా ఉన్నాయి.":lang==="hi"?"सभी सिस्टम सामान्य हैं।":"All systems normal."}</p>
          <p style={{fontSize:13,color:"#6aaa6a"}}>{lang==="te"?"మీ పొలం ఆరోగ్యంగా ఉంది!":lang==="hi"?"आपका खेत स्वस्थ है!":"Your farm looks great!"}</p>
        </div>
        :<div style={{display:"flex",flexDirection:"column",gap:11}}>
          {insights.alerts.map((a,i)=>(
            <div key={i} style={{background:aBg(a.level),border:`1.5px solid ${aBdr(a.level)}`,borderRadius:14,padding:"15px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.8px",color:aTxt(a.level),background:`${aBdr(a.level)}60`,padding:"2px 9px",borderRadius:100}}>{aTag(a.level)}</span>
                <span style={{fontSize:10,color:aTxt(a.level),fontWeight:500}}>{a.tag}</span>
              </div>
              <p style={{fontSize:14,color:aTxt(a.level),lineHeight:1.6,fontWeight:500}}>{a.msg}</p>
            </div>
          ))}
        </div>}
    </div>
  );

  const pages={dashboard:<PageDashboard/>,sensors:<PageSensors/>,analysis:<PageAnalysis/>,irrigation:<PageIrrigation/>,disease:<PageDisease/>,crops:<PageCrops/>,alerts:<PageAlerts/>};
  const Sp=({text})=><span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:9}}><span style={{width:15,height:15,border:"2px solid rgba(255,255,255,0.4)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>{text}</span>;

  return(
    <div style={{minHeight:"100vh",background:"#f0fdf4",fontFamily:"'DM Sans',sans-serif",color:"#14532d"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .pv{animation:fadeIn 0.32s ease forwards;}
        .nt{padding:9px 15px;font-size:13px;font-weight:500;color:#4b7a4b;cursor:pointer;border-radius:8px;transition:all 0.2s;white-space:nowrap;background:transparent;border:none;font-family:'DM Sans',sans-serif;}
        .nt:hover{background:#dcfce7;color:#15803d;}
        .nt.active{background:#dcfce7;color:#15803d;font-weight:700;}
      `}</style>
      <nav style={{position:"sticky",top:0,zIndex:100,background:scrolled?"rgba(240,253,244,0.97)":"white",borderBottom:"1px solid #d1fae5",transition:"all 0.3s",boxShadow:scrolled?"0 2px 14px rgba(34,197,94,0.09)":"none"}}>
        <div style={{maxWidth:1300,margin:"0 auto",padding:"0 22px",display:"flex",alignItems:"center",justifyContent:"space-between",height:58}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <span style={{fontSize:22}}>🌾</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:18,color:"#14532d"}}>{t.brand}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:1}}>
            {navItems.map(key=><button key={key} className={`nt${page===key?" active":""}`} onClick={()=>setPage(key)}>{t.nav[key]}</button>)}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"#16a34a",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"5px 10px"}}>{time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
            {insights.alerts.length>0&&<div style={{position:"relative",cursor:"pointer"}} onClick={()=>setPage("alerts")}><div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:600,color:"#dc2626"}}>Alerts</div><span style={{position:"absolute",top:-5,right:-5,width:16,height:16,borderRadius:"50%",background:"#ef4444",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>{insights.alerts.length}</span></div>}
            <div style={{display:"flex",alignItems:"center",gap:7,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:100,padding:"5px 12px"}}>
              <span style={{fontSize:15}}>👨‍🌾</span>
              <div><div style={{fontSize:12,fontWeight:600,color:"#14532d",lineHeight:1.1}}>{userName}</div>{farmType&&<div style={{fontSize:10,color:"#6aaa6a"}}>{farmType}</div>}</div>
            </div>
            <button onClick={()=>setShowLogout(true)} style={{background:"#fef2f2",border:"1.5px solid #fca5a5",color:"#dc2626",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,padding:"7px 15px",borderRadius:100,cursor:"pointer"}}>{t.logout}</button>
          </div>
        </div>
      </nav>
      <div style={{maxWidth:1300,margin:"0 auto",padding:"26px 22px 56px"}}>
        <div key={page} className="pv">{pages[page]}</div>
      </div>
      <footer style={{borderTop:"1px solid #d1fae5",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"white"}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}><span>🌾</span><span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:14,color:"#14532d"}}>{t.brand}</span></div>
        <p style={{fontSize:11,color:"#9ca3af"}}>© 2026 · All 15 Smart Farming Features Active</p>
      </footer>
      {showLogout&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.2)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowLogout(false)}>
          <div style={{background:"white",border:"1px solid #d1fae5",borderRadius:22,padding:"34px",maxWidth:310,width:"90%",textAlign:"center",boxShadow:"0 20px 60px rgba(34,197,94,0.15)"}} onClick={e=>e.stopPropagation()}>
            <p style={{fontSize:38,marginBottom:12}}>👋</p>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:19,color:"#14532d",marginBottom:7}}>{lang==="te"?"వెళ్ళిపోతున్నారా?":lang==="hi"?"जा रहे हैं?":"Logging out?"}</h3>
            <p style={{fontSize:13,color:"#6aaa6a",marginBottom:20,lineHeight:1.6}}>{lang==="te"?"మీరు నిజంగా లాగ్ అవుట్ చేయాలనుకుంటున్నారా?":lang==="hi"?"क्या आप लॉग आउट करना चाहते हैं?":"Are you sure you want to log out?"}</p>
            <div style={{display:"flex",gap:9}}>
              <button onClick={()=>setShowLogout(false)} style={{flex:1,padding:"10px",borderRadius:10,border:"1.5px solid #bbf7d0",background:"transparent",color:"#14532d",fontFamily:"'DM Sans'",fontWeight:500,cursor:"pointer",fontSize:13}}>{lang==="te"?"రద్దు":lang==="hi"?"रद्द करें":"Cancel"}</button>
              <button onClick={handleLogout} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"white",fontFamily:"'DM Sans'",fontWeight:700,cursor:"pointer",fontSize:13}}>{t.logout}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

user login   POST
/api/v1/user/auth/login
email,password

verify user   GET
/api/v1/user/auth/verifyuser

user fulldetails GET
/api/v1/user/auth/userdetails

user Update PUT
/api/v1/user/auth/update
{fullname,phone,gender,dateOfBirth,address,image,resume} 

user Logout  GET
/api/v1/user/auth/logout


get single weeklye question all views not logined GET
/api/v1/user/weeklyquestion/get-all

get single weeklye question if user login GET
/api/v1/user/weeklyquestion/get-user



user submit weeklye question  POST
/api/v1/user/weeklyquestion/submit-answer  
{answer,questionId}




///////////////Events
event for homepage  GET
/api/v1/user/events/homepage   


event for events page GET
/api/v1/user/events/all     ? page={}&limit={}&search={}&status={}   


status = "PUBLISHED" || "COMPLETED"

get single Event   Get
/api/v1/user/events/get/{eventslug}


///////////////////////// News
news for homepage  GET

/api/v1/user/news/homepage 

news page GET
/api/v1/user/news/all   ? page={}&limit={}&search={};


get single news   Get
/api/v1/user/news/get/{newsslug}


///////////////////////// Jobs


jobs for homepage  GET
/api/v1/user/jobs/homepage 



Jobs page GET
/api/v1/user/jobs/all   ? page={}&limit={}&search={}&jobtype={}&workmode={};   

jobtype= "FULL_TIME" || "PART_TIME"  || "CONTRACT" || "INTERNSHIP"
workmode="ONSITE" || "REMOTE" || "HYBRID";


get single job      Get
/api/v1/user/jobs/get/{jobslug}


apply for job  PUT
/api/v1/user/jobs/applyjob/{jobid}



///////////////////////// Articlesss////////////////

articles for homepage  GET
/api/v1/user/learning/article/homepage 


articles page GET
/api/v1/user/learning/article/all   ? page={}&limit={}&search={} 


get single article      Get
/api/v1/user/learning/article/get/{articleslug}



/////////////////   Yt vidoes ////////
yt for homepage  GET
/api/v1/user/learning/yt/homepage

yt page GET

/api/v1/user/learning/yt/all   ? page={}&limit={}&search={} 


//时间
     function  getD1(){
         var date=new Date();
         var d1=date.toLocaleString();
         document.getElementById("datetime").innerHTML =d1; 
     }
 
     setInterval("getD1();",1000);
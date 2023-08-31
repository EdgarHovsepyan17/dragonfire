const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");

bgImage=document.createElement('img')
bgImage.src="images/sky.jpeg"

const start=document.querySelector('.start')
const startBtn=document.querySelector('.startBtn');
const settingsBtn=document.querySelector('.settingsBtn');
const settings=document.querySelector('.settings')
const recordScore=document.querySelector('.record-score')
const closeSettings=document.querySelector('.close-settings')
const backBtn=document.querySelector('.backToStart');
const gameScore=document.querySelector('.score')
let recordPoints=0

window.addEventListener('load',()=>{
  if(localStorage.getItem('record')==null){
    localStorage.setItem('record',recordPoints)
  }else{
    recordPoints=localStorage.getItem('record')
    recordScore.innerText=recordPoints
  }
})

startBtn.addEventListener('click',()=>{
  beginGame()
})

backBtn.addEventListener('click',()=>{
  backToMenu()
})


settingsBtn.addEventListener('click',()=>{
  settings.classList.remove('hide')
})

closeSettings.addEventListener('click',()=>{
  settings.classList.add('hide')
})




let data={
  airplanes:[],
  bullets:[],
  fires:[]
}

function beginGame(){
  startBtn.style.display='none'
  canvas.classList.remove('hide')
  backBtn.classList.remove('hide')
  gameScore.classList.remove('hide')

  start.classList.add('hide')

  hero._isAlive=true
  data.airplanes.length=0
  temp5=setInterval(()=>{
    createPlane()
  },850)
}


function backToMenu(){

  startBtn.style.display='block'
  canvas.classList.add('hide')
  backBtn.classList.add('hide')
  gameScore.classList.add('hide')

  start.classList.remove('hide')

  hero._isAlive=false
  data.airplanes.filter(plane=>plane instanceof Helicopter)
  .forEach(plane=>clearInterval(plane._temp))
  data.airplanes.length=0
  clearInterval(temp5)

  if(hero._score>recordPoints){
    localStorage.setItem('record',hero._score)
    recordPoints=hero._score;
    recordScore.innerText=hero._score;
  }

  hero._score=0
  
}

class Hero {
    constructor(x, y, width, height) {

      this._score=0

      this._isAlive=false
      this._notMoving=true
      this._x = x;
      this._y = y;
      this._width = width;
      this._height = height;
  
      this._speed = 8;
      
      this._xDelta = 0;
      this._yDelta = 0;

      this._speedFly = 0.5;

      this._xDeltaFly = 0;
      this._yDeltaFly = 0;
      
      this._img = document.createElement("img");
      this._img.src = "images/dragonRight.png";

      this._direction='right'

    }
    
    update() {
      gameScore.innerText=this._score

      this._x += this._xDelta;
      this._y += this._yDelta;

      this._x += this._xDeltaFly;
      this._y += this._yDeltaFly;

      if(this._x>=1920){
        this._x=0-this._width
      }else if(this._x+this._width<=0){
        this._x=1920
      }
      else if(this._y+this._height<=0){
        this._y=1080
      }
      else if(this._y>=1080){
        this._y=0-this._height
      }

      if(this._xDelta===0&&this._yDelta===0){
        if(this._notMoving)this.flyingDownUp()
      }
      
      data.airplanes.forEach(plane=>{
        if(intersect(this.getBoundingBox(),plane.getBoundingBox())){
          this._isAlive=false;
          setTimeout(()=>{
            backToMenu()
          },1500)
          if(plane instanceof HelicopterBullet){
            plane._deleteME=true
          }else{
            plane.downFall()
          }          
        }
      })
    }
    render() {
        context.drawImage(this._img, this._x, this._y, this._width, this._height);     
    }
    goRight() {      
      this._xDelta = this._speed;
      this._img.src = "images/dragonRight.png";
      this.stopFlyigDownUp()
      this._direction='right'
    }
    goLeft() {
      this._xDelta = this._speed * -1;
      this._img.src = "images/dragonLeft.png";
      this.stopFlyigDownUp()
      this._direction='left'
    }
    goUp() {
      this._yDelta = this._speed * -1;
      this.stopFlyigDownUp()
    }
    goDown() {
      this._yDelta = this._speed;
      this.stopFlyigDownUp()
    }
    stop() {
      this._notMoving=true
      this._xDelta =0;
      this._yDelta =0;
    } 
    getBoundingBox() {
      return {
        x: this._x,
        y: this._y,
        width: this._width,
        height: this._height
      };
    }
    flyingDownUp(){
      this._notMoving=false
      this._yDeltaFly =this._speedFly;
      temp1=setTimeout(()=>{
        this._yDeltaFly=-1*this._speedFly
        temp2=setTimeout(()=>{
          this.flyingDownUp()
        },500)
      },500)
    }
    stopFlyigDownUp(){
      clearTimeout(temp1)
      clearTimeout(temp2)
      this._yDeltaFly = 0;
    }
    throwFire(){
      if(this._direction==='right'){
        const fire=new Fire(this._x+this._width/2,this._y+this._height/5,100,35)
        fire.goRight();
        data.fires.push(fire)
      }
      if(this._direction==='left'){
        const fire=new Fire(this._x+this._width/5,this._y+this._height/5,100,35)
        fire.goLeft();
        data.fires.push(fire)
      }
    }
}

const hero=new Hero(900,400,250,218)

class Fire{
  constructor(x, y, width, height) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;

    this._speed = 12;

    this._xDelta = 0;
    this._yDelta = 0;

    this._img = document.createElement("img");
    this._img.src = "images/fireRight.png";

  }
  
  update() {
    this._x += this._xDelta;
    this._y += this._yDelta;

    if(this._x>=1920){
      this._deleteME=true
    }else if(this._x+this._width<=0){
      this._deleteME=true
    }

    data.airplanes.forEach(plane=>{
      if(intersect(this.getBoundingBox(),plane.getBoundingBox())){
        if(plane._secondLife===true){
          plane._secondLife=false;
          this._deleteME=true
        }else{
          this._deleteME=true
          if(plane instanceof HelicopterBullet){
            plane._deleteME=true
          }else{
            plane.downFall()
            hero._score+=plane._score
            plane._score=0
          }
        }
      }
    })
  }
  render() {
      context.drawImage(this._img, this._x, this._y, this._width, this._height);     
  }
  goRight() {      
    this._xDelta = this._speed;
    this._img.src = "images/fireRight.png";
  }
  goLeft() {
    this._xDelta = this._speed * -1;
    this._img.src = "images/fireLeft.png";
  }
  getBoundingBox() {
    return {
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height
    };
  }
}
 

class SunMoon{
  constructor() {
    this._x = 50;
    this._y = 140;
    this._width = 150;
    this._height = 180;

    this._speed = 0.5;

    this._xDelta = 0;
    this._yDelta = 0;

    this._img = document.createElement("img");
    this._img.src = "images/sun.png";

    this._isItDay=true

  }
  
  update() {
    this._x += this._xDelta;
    this._y += this._yDelta;

    if(this._x>=1920){
      this._x=0-this._width
      if(this._isItDay){
        this._img.src="images/moon.png"
        bgImage.src="images/skyDark.png"
        this._isItDay=false
      }else{
        this._img.src="images/sun.png"
        bgImage.src="images/sky.jpeg"
        this._isItDay=true
      }
    }
  }
  render() {
      context.drawImage(this._img, this._x, this._y, this._width, this._height);     
  }
  goRight() {      
    this._xDelta = this._speed;
  }
}
  const sunMun=new SunMoon
  sunMun.goRight()

 class Airplane {
    constructor() {

      this._xDelta = 0;
      this._yDelta = 0;
           
    }
    
    update() {
      this._x += this._xDelta;
      this._y += this._yDelta;

      if(this._x>=1920){
        this._deleteME=true
      }else if(this._x+this._width<=0){
        this._deleteME=true
      }else if(this._y>canvas.height){
        this._deleteME=true
      }
    }
    render() {
        context.drawImage(this._img, this._x, this._y, this._width, this._height);   
    }
    downFall(){
      this._isCrushed=true;
      this._img.src='images/airplaneCrashed.png'
      this._xDelta=0;
      this._yDelta=7;
    }
    goRight() {      
      this._xDelta = this._speed;
    }
    goLeft() {
      this._xDelta = this._speed * -1;
    }
    getBoundingBox() {
      return {
        x: this._x,
        y: this._y,
        width: this._width,
        height: this._height
      };
    }
    createCordinats(){
      this._y=random(0,1050-this._height)
      let side=random(0,2)
      if(side===0){
        this._x=0-this._width;
        this.goRight()
      }else{
        this._x=1920;
        this.goLeft()
      }
    }
}

class SmallAirplane extends Airplane{
  constructor(){
    super()

    this._score=10
    this._speed=2

    this._width=225
    this._height=63

    this._img = document.createElement("img");
  }
  createCordinats(){
    super.createCordinats()
    if(this._x===0-this._width){
      this._img.src='images/airplaneRight.png'
    }else{
      this._img.src='images/airplaneLeft.png'
    }
  }
}

class MilitaryAirplane extends Airplane{
  constructor(){
    super()

    this._score=20
    this._secondLife=true
    this._speed=2

    this._width=400
    this._height=140

    this._img = document.createElement("img");
  }
  createCordinats(){
    super.createCordinats()
    if(this._x===0-this._width){
      this._img.src='images/militaryPlaneRight.png'
    }else{
      this._img.src='images/militaryPlaneLeft.png'
    }
  }
}

class Jet extends Airplane{
  constructor(){
    super()

    this._score=50
    this._speed=8

    this._width=150
    this._height=50

    this._img = document.createElement("img");
  }
  createCordinats(){
    super.createCordinats()
    if(this._x===0-this._width){
      this._img.src='images/jetRight.png'
    }else{
      this._img.src='images/jetLeft.png'
    }
  }
}

class Helicopter {
  constructor() {

    this._score=30
    this._secondLife=true

    this._width=200;
    this._height=100;

    this._speed=1
    this._xDelta = 0;
    this._yDelta = 0;

    this._speedFly = 0.5;
    this._xDeltaFly = 0;
    this._yDeltaFly = 0;

    this._img = document.createElement("img");
    
    this._direction='right'

    this._temp===undefined
  }
  
  update() {
    this._x += this._xDelta;
    this._y += this._yDelta;

    this._x += this._xDeltaFly;
    this._y += this._yDeltaFly;

    if(this._y===this._stayY){
      this.stop()
      if(this._temp===undefined){
        this.shoot()
      }
    }
    if(this._isCrushed===true){
      clearInterval(this._temp)
    }
    if(this._x>=1920){
      this._deleteME=true
    }else if(this._x+this._width<=0){
      this._deleteME=true
    }else if(this._y>canvas.height){
      this._deleteME=true
    }
  }
  render() {
      context.drawImage(this._img, this._x, this._y, this._width, this._height);   
  }
  downFall(){
    this._isCrushed=true;
    clearInterval(temp3)
    clearInterval(temp4)
    this._img.src='images/helicopterCrashed.png'
    this._xDelta=0;
    this._yDelta=7;
  }
  goDown() {      
    this._yDelta = this._speed;
  }
  goUp() {
    this._yDelta = this._speed * -1;
  }
  getBoundingBox() {
    return {
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height
    };
  }
  createCordinats(){
    let xSide=random(0,2)
    if(xSide===0){
      this._x=300
      this._img.src='images/helicopterRight.png'
      this._direction='right'
    }else{
      this._x=1600
      this._img.src='images/helicopterLeft.png'
      this._direction='left'
    }
    let ySide=random(0,2)
    if(ySide===0){
      this._y=1080
      this.goUp()
    }else{
      this._y=0-this._width;
      this.goDown()
    }
    this._stayY=random(0,canvas.height-this._height)
  }
  stop(){
    this._xDelta = 0;
    this._yDelta = 0;
    this.flyingDownUp()
  }
  flyingDownUp(){
    this._yDeltaFly =this._speedFly;
    temp3=setTimeout(()=>{
      this._yDeltaFly=-1*this._speedFly
      temp4=setTimeout(()=>{
        this.flyingDownUp()
      },500)
    },500)
  }
  shoot(){
    this._temp=setInterval(()=>{
      if(this._direction==='right'){
        const bullet=new HelicopterBullet(this._x+this._width/3*2,this._y+this._height/5*3,100,35)
        bullet.goRight();
        data.airplanes.push(bullet)
      }
      else if(this._direction==='left'){
        const bullet=new HelicopterBullet(this._x,this._y+this._height/5*3,100,35)
        bullet.goLeft();
        data.airplanes.push(bullet)
      }
    },1000)
  }
}

class HelicopterBullet{
  constructor(x,y,width,height) {

    this._x=x
    this._y=y
    this._width=width;
    this._height=height;

    this._speed=5
    this._xDelta = 0;
    this._yDelta = 0;

    this._img = document.createElement("img");
  }
  
  update() {
    this._x += this._xDelta;
    this._y += this._yDelta;

    if(this._x>=1920){
      this._deleteME=true
    }else if(this._x+this._width<=0){
      this._deleteME=true
    }
  }
  render() {
      context.drawImage(this._img, this._x, this._y, this._width, this._height);   
  }
  goLeft() {      
    this._xDelta = this._speed*-1;
    this._img.src='images/rocketLeft.png'
  }
  goRight() {
    this._xDelta = this._speed;
    this._img.src='images/rocketRight.png'
  }
  getBoundingBox() {
    return {
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height
    };
  }
  
}

function createPlane(){
  let number=random(0,4)
  if(number===0){
    const plane=new SmallAirplane
    plane.createCordinats()
    data.airplanes.push(plane)
  }else if(number===1){
    const plane=new MilitaryAirplane
    plane.createCordinats()
    data.airplanes.push(plane)
  }else if(number===2){
    const plane=new Jet
    plane.createCordinats()
    data.airplanes.push(plane)
  }else if(number===3){
    const plane=new Helicopter
    plane.createCordinats()
    data.airplanes.push(plane)
  }
}


  function update(){
    sunMun.update()
    if(hero._isAlive)hero.update()
    data.fires.forEach(fire=>fire.update())
    data.airplanes.forEach(plane=>plane.update())

    data.airplanes=data.airplanes.filter(plane=>plane._deleteME!==true)
    data.fires=data.fires.filter(fire=>fire._deleteME!==true)
  }

  function render(){     
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bgImage,0,0,canvas.width,canvas.height)
    sunMun.render()
    data.airplanes.forEach(plane=>plane.render())
    if(hero._isAlive)hero.render()
    data.fires.forEach(fire=>fire.render())
  }

  

  function loop() {
    requestAnimationFrame(loop);
    update();
    render();
  }

  loop()
  
  


  document.addEventListener("keydown", (evt) => {
    if (evt.code === "ArrowRight") {
      hero.goRight();
    } else if (evt.code === "ArrowLeft") {
      hero.goLeft();
    } else if (evt.code === "ArrowDown") {
        hero.goDown();
    } else if (evt.code === "ArrowUp") {
        hero.goUp();
    } 
     else if (evt.code === "Space") {
        if(hero._isAlive)hero.throwFire()
    } 
  });
  
  document.addEventListener("keyup", (evt) => {
    if(hero._yDeltaFly===0)hero.stop();
  });

  let temp1,temp2,temp3,temp4,temp5

  function random(min,max){
    return Math.floor(Math.random()*(max-min))+min;
}

function intersect(rect1, rect2) {
  const x = Math.max(rect1.x, rect2.x),
    num1 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width),
    y = Math.max(rect1.y, rect2.y),
    num2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
  return (num1 >= x && num2 >= y);
};


  
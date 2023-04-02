let data;
let compounds = [];
let weights = [];
let safeties = [];
let quants = [];
let detects = [];
let sims1 = [];
let sims2 = [];
let colorOfComp = [];
let formulas = [];
let firstIteration = true;

let bkgColor;
let textColor;
let sepWidth;
let sepHeight;
let rectWidth;
let rectHeight;
let numCols = 8;
let numRows = 10;
let exitRad = 4;
let startTime;

let maxToxic = 10;
let maxConcentration = 5.033;

let displayOne = false;
let displayedIndex;

let startX, startY, moved;

function preload() {
  data = loadTable('data2.csv', 'csv', 'header', () => {
    // Process the data
    for (let i = 0; i < data.getRowCount(); i++) {
      let compound = data.getString(i, 'COMPOUND');
      let weight = data.getNum(i, 'Molecular Weight (g/mol)');
      let safety = data.getNum(i, 'Limit of Safety (µg/g)');
      let quant = data.getNum(i, 'Limit of Quantitation (µg/g)');
      let detect = data.getNum(i, 'Limit of Detection (µg/g)');
      let sim1 = data.getNum(i, 'Simulated 1 (µg/g)');
      let sim2 = data.getNum(i, 'Simulated 2 (µg/g)');
      let formula = data.getString(i, "Molecular Formula");
      //console.log(formula);
      compounds.push(compound);
      weights.push(weight);
      safeties.push(safety);
      quants.push(quant);
      detects.push(detect);
      sims1.push(sim1);
      sims2.push(sim2);
      formulas.push(formula);
      
    }
  });
}



function setup() {
  createCanvas(windowWidth, windowWidth*16/9);
  sepWidth = width/numCols;
  sepHeight = height/numRows;
  rectWidth = sepWidth -10;
  rectHeight = sepHeight-10;
  colorMode(HSB, 360, 100, 100);

}


function draw() {
  updateColors();
  if (!displayOne){
    background(bkgColor);
    drawCompounds();
  }
  else{
    drawOneCompound();
  }
  
}

function updateColors(){
  const myBody = document.getElementById("myBody");
  const styles = window.getComputedStyle(myBody);
  bkgColor = styles.getPropertyValue("background-color");
  textColor = styles.getPropertyValue("color");
}


function drawCompounds(){
  for (let i = 0; i < compounds.length; i++){
    let compound = compounds[i];
    let weight = weights[i];
    let safety = safeties[i];
    let quant = quants[i];
    let detect = detects[i];
    let sim1 = sims1[i];
    let sim2 = sims2[i];
    let y = floor(i/numCols);
    let x = i%numCols;
    push();
    translate((x+0.5)*sepWidth, (y+0.5)*sepHeight);
    drawCompound(compound, weight, safety, quant, detect, sim1, sim2);
    pop();
  }
  firstIteration = false;
}

function drawCompound(compound, weight, safety, quant, detect, sim1, sim2){
  noFill();
  stroke(textColor);
  rectMode(CENTER);
  rect(0,0,rectWidth, rectHeight);
  let c = drawHexagon(safety, sim2);
  if (firstIteration){
    colorOfComp.push(c);
  }
  textAlign(CENTER);
  fill(textColor);
  noStroke();
  textSize(width*0.007);
  let compoundFormated = "";
  for (let letter of compound){
    if (letter != ' '){
      compoundFormated += letter;
    }
    else{
      compoundFormated += '\n';
    }
  }
  text(compoundFormated, 0, rectWidth/2.5);
}

function drawHexagon(safety, sim){
  let h = map(safety, 0, maxToxic, 120, 0);
  let b = map(sim, 0, maxConcentration, 70, 20);
  let c = color(h, 70, b);
  let o = map(sim, 0, maxConcentration, 0, 255);
  //fill(red(c), green(c), blue(c));
  fill(c);
  noStroke();
  push();
  translate(0, -5);
  let sideLength = rectWidth/3;
  beginShape();
  for (let i = 0; i < 6; i++) {
    let angle = i * TWO_PI / 6;
    let x = sideLength * cos(angle);
    let y = sideLength * sin(angle);
    vertex(x, y);
  }
  endShape(CLOSE);
  pop();
  return c;
}

function drawOneCompound(){
  let c = colorOfComp[displayedIndex];
  background(c);
  drawExit();
  drawInfo();
}

function drawExit(){
  push();
  translate(width - 20, 20);
  fill(360, 0, 100, 150);
  noStroke();
  rectMode(CENTER);
  //rect(0,0, 10,10);
  stroke(360, 0, 100);
  line(-exitRad,-exitRad,exitRad,exitRad);
  line(-exitRad,exitRad,exitRad,-exitRad);
  pop();
}

function drawInfo(){
  let name = compounds[displayedIndex];
  let mWeight = weights[displayedIndex];
  let safe = safeties[displayedIndex];
  let conc = sims2[displayedIndex];
  fill(255);
  noStroke();
  textSize(20);
  textAlign(CENTER);
  let initial = 50;
  text(name, width/2, initial);
  textSize(10);
  let sep = 20;
  text("Molecular Formula: " + formulas[displayedIndex], width/2, initial + sep);
  text("Molecular Weight (g/mol): " + mWeight.toString(), width/2, initial + 2*sep);
  text("Limit of Safety (µg/g): " + safe.toString(), width/2, initial + 3*sep);
  text("Measured Concentration (µg/g): " + conc.toString(), width/2, initial + 4*sep);
  
}



function touchStarted() {
  // record the initial position of the touch
  startX = mouseX;
  startY = mouseY;
  moved = false;
  startTime = millis();
}

function touchMoved() {
  // determine the current position of the touch
  const currentX = mouseX;
  const currentY = mouseY;

  // calculate the distance between the initial and current positions
  const distance = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));

  // if the distance is greater than 10 pixels, assume the user is dragging
  if (distance > 10) {
    moved = true;
  }
}

function touchEnded() {
  //tap();
  // if the touch didn't move much and was short, assume a tap
  if (!moved && millis() - startTime < 200) {
    console.log('tap');
    tap();
  }
  
  // if the touch moved a lot and was long, assume a zoom
  else if (moved && event.changedTouches[0].duration > 500) {
    console.log('zoom');
  }
  
  // otherwise, assume a drag
  else {
    console.log('drag');
  }
}

function tap(){
  if (displayOne){
    let xRelative = mouseX - width  + 20;
    let yRelative = mouseY - 20;
    if (xRelative >= - exitRad && xRelative <= exitRad && yRelative >= -exitRad && yRelative <= exitRad){
      displayOne = false;
    }
  }
  else{
    let x = floor(mouseX / sepWidth);
    let y = floor (mouseY / sepHeight);
    displayedIndex = x + numCols*y;
    displayOne = true;
  }
}

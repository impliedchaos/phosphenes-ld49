/*
 * index.js - impliedchaos
 *
 * 
 */

var canvas,gl,program;
var vxbuf;
var vxshader,pxshader;
var sthistory = [];
var story = [];
var snum = 0;
var scount = 0;
var boop;
var b = [];
var busy = true;
var sound = true;
var gsc = 0;
var glitch = false;
var title = false;
var stats = {};

window.onload=init;

async function do_glitch(z) {
    let glen = Math.random()*1000+60;
    glitch = true;
    glitchnoise.playbackRate=Math.random()*2+0.25;
    if (sound) glitchnoise.play();
    await new Promise(r=>setTimeout(r,glen));
    glitchnoise.pause()
    glitch = false;
    glitchnoise.currentTime = 0;
    if (++gsc < 4 && Math.floor(Math.random()*2)===0) {
        glen = Math.random()*500;
        setTimeout(do_glitch,glen);
    }
}

function start() {
    title=false;
    document.getElementById('tcont').style.visibility='hidden';
    snum=0;
    stats={nice:0.0,cruel:0.0,weird:0.0,crazy:-0.4,lazy:0.0,happy:0.0,fear:0.0};
    sthistory=[];
    bgm.currentTime = 0;
    if (bgm.paused && sound) bgm.play();
    dostory(snum);
}

function dotitle() {
    title=true;
    scount=0;
    document.getElementById('acont').style.visibility='hidden';
    document.getElementById('dcont').style.visibility='hidden';
    document.getElementById('content').style.visibility='hidden';
    document.getElementById('tcont').style.visibility='visible';
    bgm.pause();
}

function dostory(idx) {
    ++scount;
    snum = idx;
    sthistory.push({sn:snum,st:Object.assign({},stats)})
    disptext();
}

function back() {
    if (busy) return;
    busy = true;
    --scount;
    if (! sthistory.length) {
        dotitle();
        return;
    }
    let old = sthistory.pop();
    snum = old.sn;
    stats = Object.assign({},old.st);
    disptext();
}

function next() {
    if (busy) return;
    let s = story[snum];
    if (! s.c) return;
    busy = true;
    dostory(s.c);
}

function dispnav() {
    let s = story[snum];
    let n = document.getElementById('nav');
    n.innerHTML = '<span onclick="back();" class="nav">Back</span>'
    if (s.c) {
        n.innerHTML += ' &nbsp; <span onclick="next();" class="nav">Next</span>';
    }
    document.getElementById('dcont').style.visibility='visible';
}

function disptext() {
    document.getElementById('survey').style.visibility = 'hidden';
    document.getElementById('acont').style.visibility='hidden';
    document.getElementById('dcont').style.visibility='hidden';
    document.getElementById('content').style.visibility='hidden';
    document.getElementById('tcont').style.visibility='hidden';
    let s = story[snum];
    if (s.answers) {
        question(snum);
        document.getElementById('content').style.visibility='visible';
    }
    if (s.n) {
        document.getElementById('name').innerHTML = '&nbsp;';
        document.getElementById('text').innerHTML = '<span class="nar">'+s.n+'</span>';
        dispnav();
    }
    if (s.mc) {
        document.getElementById('name').innerHTML = '<span class="mc">Me</span>';
        document.getElementById('text').innerHTML = '"'+s.mc+'"';
        dispnav();
    }
    if (s.md) {
        document.getElementById('name').innerHTML = '<span class="md">Dr. Detmer</span>';
        document.getElementById('text').innerHTML = '"'+s.md+'"';
        dispnav();
    }
    if (s.sa) {
        document.getElementById('name').innerHTML = '<span class="sa">Agent Guidry</span>';
        document.getElementById('text').innerHTML = '"'+s.sa+'"';
        dispnav();
    }
    if (s.glitch) {
        do_glitch();
        stats.crazy += 0.2;
    }

    busy = false;
}

async function init() {
    story = await fetch('story.json').then(result=>result.json());
    boop = new Audio('assets/audio/boop.ogg');
    bgm = new Audio('assets/audio/atmosdrone-unstable.ogg');
    bgm.loop=true;
    glitchnoise = new Audio('assets/audio/glitchnoise.ogg');
    //bgm.onended = ()=>{bgm.play()};
    b[0] = document.getElementById('b0');
    b[1] = document.getElementById('b1');
    b[2] = document.getElementById('b2');
    b[3] = document.getElementById('b3');
    canvas = document.getElementById('render');
    gl = canvas.getContext('experimental-webgl');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    vxshader = gl.createShader(gl.VERTEX_SHADER);
    let source = await fetch('vertexshader.glsl').then(result=>result.text());
    gl.shaderSource(vxshader, source);
    gl.compileShader(vxshader);

    pxshader = gl.createShader(gl.FRAGMENT_SHADER);
    source = await fetch('pixelshader.glsl').then(result=>result.text());
    gl.shaderSource(pxshader, source);
    gl.compileShader(pxshader);

    vxbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vxbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0,-1.0, 1.0,-1.0, -1.0,1.0, -1.0,1.0, 1.0,-1.0, 1.0,1.0]),gl.STATIC_DRAW);

    program = gl.createProgram();
    gl.attachShader(program, vxshader);
    gl.attachShader(program, pxshader);
    gl.linkProgram(program);
    console.log(gl.getProgramInfoLog(program));
    console.log(gl.getShaderInfoLog(pxshader));
    //gl.useProgram(program);
    program.positionLocation = gl.getAttribLocation(program, "a_position");
    program.res = gl.getUniformLocation(program, "res");
    program.time = gl.getUniformLocation(program, "time");
    program.snum = gl.getUniformLocation(program, "snum");
    program.title = gl.getUniformLocation(program, "title");
    program.nice = gl.getUniformLocation(program, "nice");
    program.cruel = gl.getUniformLocation(program, "cruel");
    program.weird = gl.getUniformLocation(program, "weird");
    program.crazy = gl.getUniformLocation(program, "crazy");
    program.lazy = gl.getUniformLocation(program, "lazy");
    program.happy = gl.getUniformLocation(program, "happy");
    program.fear = gl.getUniformLocation(program, "fear");
    program.glitch = gl.getUniformLocation(program, "glitch");

    window.addEventListener("keydown",hkey);
    draw(0.0);
    dotitle();
}

function draw(ts) {
    updatesize();
    window.requestAnimationFrame(draw);
    gl.clearColor(1.0,0.0,1.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enableVertexAttribArray(program.positionLocation);
    gl.vertexAttribPointer(program.positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2fv(program.res,new Float32Array([canvas.width,canvas.height]));
    gl.uniform1f(program.time, ts/1000);
    gl.uniform1f(program.snum, scount*1.0);
    gl.uniform1f(program.title, title ? 1.0 : 0.0);
    gl.uniform1f(program.nice, stats.nice);
    gl.uniform1f(program.cruel, stats.cruel);
    gl.uniform1f(program.weird, stats.weird);
    gl.uniform1f(program.crazy, stats.crazy);
    gl.uniform1f(program.lazy, stats.lazy);
    gl.uniform1f(program.happy, stats.happy);
    gl.uniform1f(program.fear, stats.fear);
    gl.uniform1f(program.glitch, glitch ? 1.0 : 0.0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0,-1.0, 1.0,-1.0, -1.0,1.0, -1.0,1.0, 1.0,-1.0, 1.0,1.0]),gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function question(idx) {
    document.getElementById('survey').style.visibility = 'hidden';
    let q = story[idx];
    for (let i = 0; i < 4; i++) {
        if (q.answers[i]) {
            b[i].innerHTML=(i+1).toString()+'. '+q.answers[i].text;
            if (b[i].classList.contains('answered')) {
                b[i].classList.remove('answered');
                b[i].classList.add('answer');
            }
            b[i].style.visibility='inherit';
        } else {
            b[i].style.visibility='hidden';
        }
    }
    document.getElementById('survey').style.visibility = 'inherit';
    busy = false;
}

async function answer(idx) {
    if (busy) return;
    busy = true;
    document.getElementById('content').style.visibility="hidden";
    document.getElementById('dcont').style.visibility="hidden";
    if (sound) boop.play();
    b[idx].classList.remove('answer');
    b[idx].classList.add('answered');
    let animsteps = 10;
    let animdelay = 50;
    let a = story[snum].answers[idx];
    for (let i = 0; i<animsteps; i++) {
        if (a.nice) stats.nice += a.nice/animsteps;
        if (a.happy) stats.happy += a.happy/animsteps;
        if (a.lazy) stats.lazy += a.lazy/animsteps;
        if (a.weird) stats.weird += a.weird/animsteps;
        if (a.crazy) stats.crazy += a.crazy/animsteps;
        if (a.cruel) stats.cruel += a.cruel/animsteps;
        if (a.fear) stats.fear += a.fear/animsteps;
        await new Promise(r=>setTimeout(r,animdelay));
    }
    dostory(a.c);
}

function gameover(ending) {
    document.getElementById('survey').style.visibility = 'hidden';
    if (! ending) ending = 0; // Duh.
    document.getElementById('ending').style.visibility = 'visible';
}

function updatesize() {
    if (gl.canvas.clientWidth !== gl.canvas.width || gl.canvas.clientHeight !== gl.canvas.height) {
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
}

function hkey(e) {
    if (e.code === "Digit1" || e.code === "Numpad1") answer(0);
    if (e.code === "Digit2" || e.code === "Numpad2") answer(1);
    if (e.code === "Digit3" || e.code === "Numpad3") answer(2);
    if (e.code === "Digit4" || e.code === "Numpad4") answer(3);
    if (e.code === "Space" || e.code === "Enter") {
        if (title) start()
        else next();
    }
    if (e.code === "PageUp" && (! title)) back();
}

function soundtoggle() {
    if (sound) {
        sound = false;
        document.getElementById("soundicon").alt = 'enable audio';
        document.getElementById("soundicon").src = 'assets/image/volume-off.svg';
        bgm.pause();
    } else {
        sound = true;
        document.getElementById("soundicon").alt = 'disable audio';
        document.getElementById("soundicon").src = 'assets/image/volume-high.svg';
        bgm.play();
    }
}

function abouttoggle() {
    let foo=document.getElementById("acont");
    if (foo.style.visibility == "visible")
        foo.style.visibility = "hidden"
    else
        foo.style.visibility = "visible";
}
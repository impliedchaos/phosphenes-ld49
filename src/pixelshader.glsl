#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
precision mediump int;

#define MAX_STEPS 150.0
#define MAX_DIST 20.0
#define SURF_DIST 0.001

uniform vec2 res;
uniform float time;
uniform float snum;
uniform float title;

uniform float nice;
uniform float cruel;
uniform float crazy;
uniform float weird;
uniform float lazy;
uniform float happy;
uniform float fear;
uniform float glitch;

const float PI = 3.14159265358979311599796346854;
const float PHI = 1.61803398874989484820459;  

mat2 rot(float t){float c=cos(t);float s=sin(t);return mat2(c,-s,s,c);}
mat2 scl(float k){return mat2(k,0,0,k);}

float rand(in vec2 xy, in float seed){
    return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
}

float pl(vec2 uv, float mul) {
    float h = 3.3*cos(uv.y*PI+time)*sin(uv.x*PI-time*0.31)+sin(uv.y*PI+time*1.31)*cos(uv.x*PI-time);
    h += 2.4*cos(uv.y*PI+sin(time)*3.0)*sin(uv.x*PI*2.42-cos(time)*2.2);
    float m = mod(floor(h*mul),4.0);
    return (m==1.0) ? 1.0 : (m==2.0) ? 0.5 : (m==3.0) ? 0.0 : 0.5;
}

vec4 hue2rgb(float h) {
    float x = 1.0 - abs(mod(h/(PI/3.0),2.0) - 1.0);
    float z = abs(mod(h,PI*2.0));
    if (z < PI/3.0) { return vec4(1.0,x,0.0,1.0); }
    if (z < PI*2.0/3.0) { return vec4(x,1.0,0.0,1.0); }
    if (z < PI) { return vec4(0.0,1.0,x,1.0); }
    if (z < PI*4.0/3.0) { return vec4(0.0,x,1.0,1.0); }
    if (z < PI*5.0/3.0) { return vec4(x,0.0,1.0,1.0); }
    return vec4(1.0,0.0,x,1.0);
}

vec4 sp(vec2 uv) {
    vec2 origin = vec2(0.5);
    origin.x -= sin(time*min(crazy/12.0,4.0))*min(0.5,crazy/12.0)*sin(time*3.0);
    origin.y -= cos(time*min(crazy/12.0,4.0))*min(0.5,crazy/12.0)*sin(time*3.0);
    float theta = atan(uv.y - origin.y, uv.x - origin.x);
    float dist = distance(uv,origin);
    float ch = mod(floor(degrees(theta+time-sin(dist)*lazy)/18.0),2.0);
    return (ch == 1.0) ? hue2rgb(time/10.0+PI/3.0+weird+dist*weird) : hue2rgb(time/10.0+dist*weird);
}

vec4 cc(vec2 uv, float mul) {
    vec2 origin = vec2(0.5);
    origin.x += sin(time*min(crazy/12.0,4.0))*min(0.5,crazy/12.0)*sin(time*3.0);
    origin.y += cos(time*min(crazy/12.0,4.0))*min(0.5,crazy/12.0)*sin(time*3.0);
    float dist = distance(uv,origin);
    float m = clamp(mul,1.0,25.0);
    float s = sin((dist*PI*5.0-time)*m);
    return (s < 0.0) ? hue2rgb(time/10.0+PI/3.0+weird+dist*weird) : hue2rgb(time/10.0+dist*weird);
}

vec4 hs(vec2 uv) {
    uv -= 0.5;
    uv += cos(time)*0.5-0.5;
    uv *=rot(-time);
    float t=atan(uv.y,uv.x)+PI;
    return (t<PI)?vec4(1.0):vec4(vec3(0.0),1.0);
}

vec4 bg(vec2 uv) {
    vec4 black = vec4(0.0,0.0,0.0,1.0);
    vec2 pix = floor(uv*(res.xy/4.0))/(res.xy/4.0);
    black = max(black,vec4(vec3(rand(pix*1719.0,fract(time)+1.0))/25.0,min(1.0,snum/10.0)));
    black.gb = cruel>=1.0 ? vec2(0.0) : black.gb;
    black.r *= cruel>=1.0 ? 3.0 : 1.0;
    vec4 plbg = mix(black,vec4(vec3(pl(uv,1.0+crazy),pl(uv,1.0+happy),pl(uv,1.0+lazy)),1.0),min(0.5,weird));
    vec4 spbg = mix(black,sp(uv),min(0.5,happy));
    vec4 ccbg = mix(black,cc(uv,nice),min(0.5,nice));
//    vec4 rbg = mix(black,vec4(rand(uv*1000.0,fract(time)+1.0),rand(uv*1111.0,fract(time)+2.0),rand(uv*1299.0,fract(time)*3.0),1.0),min(1.0,crazy));

    vec4 m1 = mix(ccbg,spbg,clamp(happy/nice/2.0,0.0,1.0));
    vec4 m2 = mix(plbg,m1,clamp(max(happy,nice)/weird/2.0,0.0,1.0));
    vec4 m3 = mix(hs(uv),black,0.825);
    return mix(m2,m3,min(0.75,snum/100.0));
}

void main() {
    vec2 uv;
    if (title > 0.0) {
        uv = (gl_FragCoord.xy - 0.5 * res.xy) / res.y;
        vec2 c = uv;
        uv *= scl(sin(time)+2.0);
        uv *= rot(time);
        vec2 z = sin(uv*8.0);
        gl_FragColor = mix((z.x*z.y >= 0.0) ? hue2rgb(time/3.2) : hue2rgb(time/3.2+PI/3.0),vec4(vec3(0.0),1.0),smoothstep(-0.25,0.85,dot(c,c)));
        return;
    }
    uv = gl_FragCoord.xy / res.xy;
    if (res.x > res.y) {
        uv.y *= res.y/res.x;
        uv.y += (1.0-res.y/res.x)/2.0;
    } else if (res.x < res.y) {
        uv.x *= res.x/res.y;
        uv.x += (1.0-res.x/res.y)/2.0;
    }
    
    if (glitch>0.0 && rand(uv.yy*1829.12,fract(time)+5.0) > 0.25) {
        uv.x += (sin((uv.y+time)*13.0)+cos((uv.y+time)*12.0)+sin((uv.y+time)*15.0))*0.15*sin(time*3.0);
    }
    
    gl_FragColor = bg(uv);
    //gl_FragColor = vec4(pix,0.0,1.0);

    if (glitch > 0.0 && rand(uv.xx*3300.0,fract(time)+21.0) > 0.5) {
        gl_FragColor = vec4(rand(uv*1000.0,fract(time)+1.0),rand(uv*1111.0,fract(time)+2.0),rand(uv*1299.0,fract(time)*3.0),1.0);
    }

    if (step(0.995,sin(time*fear))==1.0) gl_FragColor = vec4(vec3(1.0)-gl_FragColor.rgb,1.0);
}
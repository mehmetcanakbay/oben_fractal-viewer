vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, s, -s, c);
	return m * v;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 m = iMouse.xy/iResolution.xy;
    float zoom = pow(800., -m.x*2.);
    
    vec2 uv = (fragCoord.xy-0.5*iResolution.xy) / iResolution.y;
    uv *= 3.0;
    uv = abs(uv);
    uv = rotate(uv, 3.145*0.25);
    uv = abs(uv);
    //uv *= 2.5*zoom;
    //uv += vec2(-1.7798, 0.0000);
    
    const float max_iter = 2048.0;
    
    bool julia = true;
    vec2 z = vec2(0.);
    float founditer = 0.;
    for (float i = 0.0; i<max_iter;i+=1.0) {
        if (!julia) {
            z = vec2(z.x*z.x-z.y*z.y, 2.0*z.x*z.y) + uv; 
            if (length(z) > 2.) break;
            founditer += 1.0;
        } else {
            uv = vec2(uv.x*uv.x-uv.y*uv.y, 2.*uv.x*uv.y) + m;
            if (length(uv) > 2.) break;
            founditer += 1.0;

        }
        
    }
    
    float f = founditer/max_iter;
    f = sqrt(f);
    
    if (founditer == max_iter) {
        f = 0.0;
    }

    // Output to screen
    vec3 col = texture(iChannel0, vec2(f, 0.5)).rgb;
    fragColor = vec4(col,1.0);
}
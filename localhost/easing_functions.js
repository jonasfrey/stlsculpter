// const phi = (1 + Math.sqrt(5)) / 2;
let f_n_exppeak = function(n_x,n_offset=0){
    // https://www.desmos.com/calculator/el8eo6mxcb
    let a = Math.pow(n_x+n_offset, 2);
    let b = Math.pow(n_x-1+n_offset, 2);
    let c = Math.min(a,b)*2;
    return c; 
} 
let f_n_linio = function(n_x){
    // https://www.desmos.com/calculator/yxp8y9f6dx
    n_x = Math.abs(n_x-.5)*-2.+1.;
    return n_x
}
export {
    f_n_exppeak, 
    f_n_linio
}
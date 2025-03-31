
// let say i have two z layers of polygon points

// how can i connect them to make a custom shape in three js 


let f_a_o_p = function(
    o_trn,
    n_corners, 
    n_radius,
    n_rad_offset
){
    let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
        let n_it = parseFloat(n_idx);
        let n_it_nor = n_it/n_corners;
        // modify the polygon here 
        let o_trn2 = f_o_vec(
            Math.sin(n_tau*n_it_nor+n_rad_offset)*n_radius,
            Math.cos(n_tau*n_it_nor+n_rad_offset)*n_radius,
            0,
        )
        return f_o_vec(
            o_trn2.n_x+o_trn.n_x,
            o_trn2.n_y+o_trn.n_y,
            o_trn2.n_z+o_trn.n_z,
        )
    });
    return a_o
}

let n_tau = Math.PI*2;
let a_o_p_bottom_layer = f_a_o_p(
    f_o_vec(0,0,0),
    5., 
    10., 
    0,
);
let a_o_p_top_layer = f_a_o_p(
    f_o_vec(0,0,10),//z is 10, so this layer is elevated
    5., 
    10., 
    0,
);

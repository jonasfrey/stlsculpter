
async function() {
    let o_mod = await import("./threejs_custom_extrusions.js");

    let n_its_x = 50; 
    let n_its_y = 50;

    //two for loops
    let a_o_mesh = [];  
    let n_radius_top = .6;
    let n_radius_bottom = .6;
    let n_polygon_points = 64; 
    for(let n_it_x = 0; n_it_x < n_its_x; n_it_x+=1){
        let n_it_x_nor = n_it_x / n_its_x;
        for(let n_it_y = 0; n_it_y < n_its_y; n_it_y+=1){
            let n_it_y_nor = n_it_y / n_its_y;

            let o_trn_nor = {
                n_x: (n_it_x_nor-.5)*2.,
                n_y: (n_it_y_nor-.5)*2.,    
            };
            let n_d_cntr = Math.sqrt(
                Math.pow(o_trn_nor.n_x,2) + Math.pow(o_trn_nor.n_y,2)
            );
            if(n_d_cntr > 1.){
                continue
            }
            n_d_cntr = 1.- n_d_cntr;
            let n_extr = 10.*n_d_cntr;
             
            const geometry = new THREE.BoxGeometry( n_radius_bottom,n_extr,n_radius_bottom ); //new THREE.CylinderGeometry( n_radius_top,n_radius_bottom, n_extr, n_polygon_points ); 
            let o_mesh = f_o_shaded_mesh(geometry);
            o_mesh.rotation.x = Math.PI/2;

            o_mesh.position.set(
                o_trn_nor.n_x*n_its_x * n_radius_bottom*.5,
                o_trn_nor.n_y*n_its_y * n_radius_bottom*.5,
                n_extr/2
            );

            
            a_o_mesh.push(o_mesh)
        }
    }

     
    // a_o_mesh = o_mod.f_a_o_mesh_hexagonal_triangle_tiling(
    //     n_radius_inner,
    //     n_radius_outer,
    //     n_extrusion
    // );



    return a_o_mesh;
}
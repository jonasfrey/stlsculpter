function() {
    

    let n_scl_x_cube = 10;
    let n_scl_y_cube = 10;
    let n_scl_z_cube = 10; 
    let n_its_cube_x = 24;
    let n_its_cube_y = 24;
    let a_o_mesh = []
    for(let n_it_cube_x = 0; n_it_cube_x <= n_its_cube_x; n_it_cube_x+=1){
        let n_it_cube_x_nor = n_it_cube_x / n_its_cube_x;
        for(let n_it_cube_y = 0; n_it_cube_y <= n_its_cube_y; n_it_cube_y+=1){
            let n_it_cube_y_nor = n_it_cube_y / n_its_cube_y;
            let nm1 = (n_it_cube_x%2);
            let nm2 = (n_it_cube_y%2);
            let o_pos = {
                x:n_it_cube_x*n_scl_x_cube,
                y:n_it_cube_y*n_scl_y_cube,
                z:0
            }
            let o_p_center = {
                x: n_its_cube_x*n_scl_x_cube/2,
                y: n_its_cube_y*n_scl_y_cube/2,
                z: 0
            }
            let o_delta = {
                x: o_pos.x - o_p_center.x,
                y: o_pos.y - o_p_center.y
            };
            let n_dist = Math.sqrt(
                o_delta.x*o_delta.x +
                o_delta.y*o_delta.y
            );
            let n_dist_max = Math.sqrt(
                Math.pow(n_its_cube_x*n_scl_x_cube, 2.),
                Math.pow(n_its_cube_y*n_scl_y_cube, 2.),
            );
            let n_dist_nor = n_dist / n_dist_max;
            //n_dist_nor = 1.-n_dist_nor;
            let ndnp = n_dist_nor//Math.pow(n_dist_nor, 2.);
            let n_factor =  (nm1 == nm2) ? 0.5:1.0;
            n_scl_z_cube = 1+n_dist*n_factor;

            let o_geo = new THREE.BoxGeometry( n_scl_x_cube, n_scl_y_cube, n_scl_z_cube )
            let o_mesh = f_o_shaded_mesh(o_geo);

            o_mesh.position.set(
                o_pos.x, 
                o_pos.y, 
                n_scl_z_cube/2.
            );

            if(n_dist_nor > 0.5){
                
                a_o_mesh.push(
                    o_mesh
                );

            }

        }
    }


    let n_radius_ring_inner = 2
    let n_radius_ring_outer = 4;
    
    let o_extruded_mesh = f_o_extruded_ring(n_radius_ring_inner,n_radius_ring_outer, 2, 128);
    let o_mesh = f_o_shaded_mesh(o_extruded_mesh);
    o_mesh.position.set(
        4, 
        4, 
        0
    )
    // a_o_mesh.push(o_mesh);
            return a_o_mesh
}
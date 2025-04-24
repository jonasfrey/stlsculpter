function() {
    

    let n_scl_x_cube = 3;
    let n_scl_y_cube = 3;
    let n_scl_z_cube = 3; 
    let n_its_cube_x = 12;
    let n_its_cube_y = 12;
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
            n_dist_nor = 1.-n_dist_nor;
            let ndnp = Math.pow(n_dist_nor, 2.);
            let n_factor =  (nm1 == nm2) ? 3: 6;
            n_scl_z_cube = 1+ndnp*n_factor;

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

    let f_o_extruded_ring = function(
        n_radius_inner, 
        n_radius_outer, 
        n_extrusion = 2, 
        n_polygon_points = 32
    ){
        const shape = new THREE.Shape();
        // shape.moveTo( 0,0 );
        // shape.lineTo( 0, width );
        // shape.lineTo( length, width );
        // shape.lineTo( length, 0 );
        // shape.lineTo( 0, 0 );
        let o0 = {}
        
        for(let n= 0; n<=n_polygon_points; n+=1){
            let n_it_nor = n / n_polygon_points;
            let o = {
                x: Math.sin(n_it_nor*n_tau)*n_radius_outer, 
                y: Math.cos(n_it_nor*n_tau)*n_radius_outer
            };
            if(n == 0){
                shape.moveTo( o.x, o.y );
                o0  = o;
            }else{
                shape.lineTo( o.x, o.y );
            }
        } 
        for(let n= n_polygon_points; n>=0; n-=1){
            let n_it_nor = n / n_polygon_points;
            let o = {
                x: Math.sin(n_it_nor*n_tau)*n_radius_inner, 
                y: Math.cos(n_it_nor*n_tau)*n_radius_inner
            };

            shape.lineTo( o.x, o.y );
        } 
        shape.lineTo( o0.x, o0.y );
        const extrudeSettings = {
            steps: 2,
            depth: n_extrusion,
            bevelEnabled: false,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 0
        };

        
        const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        return geometry
        // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // const mesh = new THREE.Mesh( geometry, material ) ;
        // scene.add( mesh );

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
    a_o_mesh.push(o_mesh);
            return a_o_mesh
}
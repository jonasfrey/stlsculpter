function() {
    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 0.2;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 600.;
            let a_o_p_outside = [];
            let n_radius_base = n_height/1.618;
            // const phi = (1 + Math.sqrt(5)) / 2;
    
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            function f_a_o_p(
                n_it_layer_nor
                ) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;
                    let n_amp = n_radius_base;
                    let n_square_wave = 0.;
                    let n_its_sw = 200.;
                    let n_its_wave = 20;
                    let nx = ((n_it_nor_corner*n_its_wave)%1)*n_tau;
                    nx*=(1.+Math.sin(n_it_layer_nor*n_tau*2.)*.1l);
                    nx+= n_tau/4;
                    for (let n_it_sw = 0.; n_it_sw < n_its_sw; n_it_sw += 1) {
                        let n = (n_it_sw * 2) + 1;
                        n_square_wave += (1. / n) * Math.sin(n * nx);
                    }
                    n_amp+= n_square_wave*3.;

                    let n_rad_offset = 0;
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        n_it_layer_nor*n_height
                    );
        
                    return o_trn1
        
        
                }).flat();
                return a_o
            }
        
        
        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
        
                let a_o_p = f_a_o_p(
                    n_it_layer_nor
                );
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p(a_o_p)
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
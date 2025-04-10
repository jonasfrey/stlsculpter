function() {
    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 400.;
            let a_o_p_outside = [];
            let n_pc = 48.;
            let n_radius_base = n_height*0.05;
            // const phi = (1 + Math.sqrt(5)) / 2;
            let f_n_exppeak = function(n_x,n_offset=0){
                // https://www.desmos.com/calculator/el8eo6mxcb
                let a = Math.pow(n_x+n_offset, 2);
                let b = Math.pow(n_x-1+n_offset, 2);
                let c = Math.min(a,b)*2;
                return c; 
            } 
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
                    n_amp+= Math.sin(n_it_layer_nor*0.95*n_tau)*10.
                    let n_rad_offset = 0;
                    let ntw = f_n_exppeak((n_it_layer_nor*3.)%1+.5);
                    n_rad_offset += ntw*0.5;
                    let n2 = (n_it_nor_corner*n_pc)%1;
                    let n3 = f_n_exppeak(n2)*10.+.9;
                    let n4 = Math.min(1, n3);
                    n_amp+=n4*20.;
                    
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
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, a_o_p[0].n_z), ...a_o_p])
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
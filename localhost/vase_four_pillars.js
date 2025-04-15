function() {
    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 500.;
            let a_o_p_outside = [];
            let n_radius_base = n_height*.33///1.618;
            let n_its_2 = 4.;
            // const phi = (1 + Math.sqrt(5)) / 2;
    
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            let f_n_dist = function (o, o2 = null) {
        if (o2 != null) {
            o = f_o_vec(
                o.n_x - o2.n_x,
                o.n_y - o2.n_y,
                o.n_z - o2.n_z,
            )
        }
        return Math.sqrt(
            Math.pow(o.n_x, 2)
            + Math.pow(o.n_y, 2)
            + Math.pow(o.n_z, 2)
        )
    }

            function f_a_o_p(
                n_it_layer_nor
                ) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx)+1;
                    let n_it_nor_corner = n_it / n_corners;
                    let n_it_2 = (n_it_nor_corner*n_its_2);
                    let n_it_2_frc = n_it_2%1;
                    let n_it_2_int = parseInt(n_it_2);
                    let nc = (1./n_its_2)*n_it_2_int;

                    let n_amp = n_radius_base;
                    n_amp += Math.sin(n_it_layer_nor*0.95*n_tau)*n_radius_base*.4;
                    let n_rad_offset = 0//n_it_layer_nor;

                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        0
                    );
                    let o_trnc = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(nc * n_tau + n_rad_offset) * n_amp,
                        Math.cos(nc * n_tau + n_rad_offset) * n_amp,
                        0
                    );
                    let n_amp2 = n_radius_base*.4;
                    n_amp2 += Math.sin(n_it_layer_nor*n_tau*3.)*5.;
                    let n2 = (n_it_2_frc-.5)*.5;
                    let n_it2nor_start  = nc+n2;
                    n_amp2 += Math.sin(n_it_2_frc*n_tau*9.)*.5+.5
                    let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it2nor_start * n_tau) * n_amp2,
                        Math.cos(n_it2nor_start * n_tau) * n_amp2,
                        0
                    );
                    let o_trn3 = f_o_vec(
                        o_trnc.n_x+o_trn2.n_x,
                        o_trnc.n_y+o_trn2.n_y,
                        0,
                    )
                    let nl1 = f_n_dist(o_trn1);
                    let nl3 = f_n_dist(o_trn3);
                    let o = o_trn1;
                    if(nl3 > nl1){
                        o = o_trn3;
                    }
                    o.n_z = n_it_layer_nor*n_height;
                    return o;
        
        
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
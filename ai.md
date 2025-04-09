i have the following 

n_idx_corner_nor // from 0.0 to 1.0 the normalized value of the index of the corner
n_tau = 6.28...;
n_radius = 10.; 

with the formula 
x: sin(n_idx_corner_nor*n_tau)*n_radius,
y: cos(n_idx_corner_nor*n_tau)*n_radius,

i can get a regular polygon. 

if i do first 
n_radius += sin(n_idx_corner_nor*n_tau*10.) 

i can get a 'wavy' pattern onto the radius. 

what cool shapes could i create else ?
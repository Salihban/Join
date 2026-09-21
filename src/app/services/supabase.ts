import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Injectable({
    providedIn: 'root'
})

export class Supabase {
    readonly supabaseUrl: string = 'https://nykpukuugpmurwpmdkjc.supabase.co';

    readonly supabaseKey: string = 'sb_publishable_U0gfFBH_95Vfkbcm9nxQPQ_13uGLKr4';
    
    readonly supabase = createClient(this.supabaseUrl, this.supabaseKey);
}

import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Injectable({
    providedIn: 'root'
})

export class Supabase {
    readonly supabaseUrl: string = 'https://iqtazjkqlvyevyxktbtp.supabase.co';

    readonly supabaseKey: string = 'sb_publishable_AM62FvBqBsCXGImh7p-6vQ_ZAA2vw38';
    
    readonly supabase = createClient(this.supabaseUrl, this.supabaseKey);
}

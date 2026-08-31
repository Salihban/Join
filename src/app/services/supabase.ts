import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Injectable({
    providedIn: 'root'
})

export class Supabase {
    readonly supabaseUrl: string = 'https://mbifznamhyihpgduvqru.supabase.co';

    readonly supabaseKey: string = 'sb_publishable_JUaeWi8_jhlIrDYKFIr-HQ_ZPNiPis2';
    
    readonly supabase = createClient(this.supabaseUrl, this.supabaseKey);
}
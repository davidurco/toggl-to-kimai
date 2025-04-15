import { create } from 'axios';

export const axios = create({
    headers: {
        'Content-Type': 'application/json'
    }
});

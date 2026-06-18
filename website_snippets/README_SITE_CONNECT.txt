CONECTARE WEBSITE VERCEL LA API RENDER

1. Copiaza api.js in folderul site-ului tau, langa index.html.
2. In api.js schimba:
   const API_URL = 'https://LINKUL-TAU-RENDER.onrender.com';

3. In index.html, inainte de </body>, adauga:
   <script src="api.js"></script>

4. In cardurile din dashboard pune ID-urile:
   <h3 id="playersOnlineCount">0</h3>
   <h3 id="bannedPlayersCount">0</h3>
   <h3 id="totalStaffCount">0</h3>
   <h3 id="casesCount">0</h3>

5. In players.html creeaza tabelul asa:
   <tbody id="playersList"></tbody>
   apoi adauga inainte de </body>:
   <script src="api.js"></script>

6. In staff.html:
   <tbody id="staffList"></tbody>
   <script src="api.js"></script>

7. In banati.html:
   <tbody id="bansList"></tbody>
   <script src="api.js"></script>

import {initClient} from 'rwsdk/client';
import '@/app/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

// 🎨 CSS modules used by Server Components must be imported here for dev mode.
// In dev, Vite injects CSS via client-side imports. Server Components run on
// the server, so their CSS module imports don't trigger client-side injection.
// See: https://github.com/redwoodjs/sdk/issues/617
import '@/app/components/Achievements.module.css';
import '@/app/components/AssassinationAction.module.css';
import '@/app/components/CombinedAnnotatedTable.module.css';
import '@/app/components/EndGameEventHandler.module.css';
import '@/app/components/EventHandler.module.css';
import '@/app/components/Game.module.css';
import '@/app/components/GameInterface.module.css';
import '@/app/components/GameParticipants.module.css';
import '@/app/components/GamePlayerList.module.css';
import '@/app/components/Lobby.module.css';
import '@/app/components/LobbyPlayerList.module.css';
import '@/app/components/Login.module.css';
import '@/app/components/LogoutButton.module.css';
import '@/app/components/LossReasonStats.module.css';
import '@/app/components/MissionAction.module.css';
import '@/app/components/Missions.module.css';
import '@/app/components/MissionSummaryTable.module.css';
import '@/app/components/RoleList.module.css';
import '@/app/components/RoleStatsTable.module.css';
import '@/app/components/SpecialRoleStats.module.css';
import '@/app/components/SpoilerReveal.module.css';
import '@/app/components/StatsDisplay.module.css';
import '@/app/components/TeamProposalAction.module.css';
import '@/app/components/TeamVoteAction.module.css';
import '@/app/components/Toast.module.css';
import '@/app/components/Toolbar.module.css';
import '@/app/components/ToolbarQuitButton.module.css';
import '@/app/components/UserLogin.module.css';
import '@/app/components/ViewRoleButton.module.css';
import '@/app/components/YearlyStatsTable.module.css';
import '@/app/components/GameConclusion.module.css';
import '@/app/components/MissionResultEventHandler.module.css';
import '@/app/components/StartGameEventHandler.module.css';
import '@/app/components/ActionPane.module.css';
import '@/app/pages/game/GamesList.module.css';
import '@/app/pages/players/PlayersPage.module.css';
import '@/app/pages/person/PersonDetail.module.css';

initClient();

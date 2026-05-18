import AdminShell from "../components/AdminShell";
import { Progress, Stat } from "../components/Ui";
import { notifications } from "../data";

export default function DashboardPage() {
  return (
    <AdminShell>
      <section className="stats-grid">
        <Stat label="Active Members" value="342" />
        <Stat label="Monthly Revenue" value="Rs 7.8L" />
        <Stat label="New Enquiries" value="46" />
        <Stat label="Classes Today" value="12" />
      </section>
      <section className="content-grid">
        <div className="card section">
          <h2>Weekly Goals</h2>
          <div className="progress-list">
            <Progress label="Membership renewals" value={82} />
            <Progress label="Trial conversions" value={64} />
            <Progress label="Personal training slots" value={73} />
            <Progress label="Contact follow-ups" value={50} />
          </div>
        </div>
        <div className="card section">
          <h2>Notifications</h2>
          <div className="notification-panel-list">
            {notifications.map((item) => (
              <div className="mini-notification" key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

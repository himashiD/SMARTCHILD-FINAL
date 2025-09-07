import { pool } from "../db.js";

// Fetch Vaccination Data for a specific user
export const fetchVaccinationData = async (req, res) => {
  const { userid } = req.params;

  try {
    const [rows] = await pool.execute(
      `SELECT childvaccines_id, child_id, first_name, last_name, dob, 
              BCG, OPV_1, fIPV_1, OPV_2, fIPV_2, OPV_3, 
              MMR_1, JE_1, OPV_4, MMR_2, OPV_5, HPV_1, HPV_2, aTd
       FROM child_vaccination
       WHERE child_id = ? ORDER BY childvaccines_id DESC`, 
      [userid]
    );
    return res.json(rows);
  } catch (err) {
    console.error("fetchVaccinationData error:", err?.message);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// Get upcoming vaccination notifications
export const getVaccinationNotifications = async (req, res) => {
  try {
    // Get current date and tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates for SQL query (YYYY-MM-DD)
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Query to find vaccinations scheduled for tomorrow
    const [rows] = await pool.execute(
      `SELECT cv.child_id, cv.first_name, cv.last_name, cv.dob,
              c.email,
              CASE 
                WHEN cv.BCG = ? THEN 'BCG'
                WHEN cv.OPV_1 = ? THEN 'OPV_1'
                WHEN cv.fIPV_1 = ? THEN 'fIPV_1'
                WHEN cv.OPV_2 = ? THEN 'OPV_2'
                WHEN cv.fIPV_2 = ? THEN 'fIPV_2'
                WHEN cv.OPV_3 = ? THEN 'OPV_3'
                WHEN cv.MMR_1 = ? THEN 'MMR_1'
                WHEN cv.JE_1 = ? THEN 'JE_1'
                WHEN cv.OPV_4 = ? THEN 'OPV_4'
                WHEN cv.MMR_2 = ? THEN 'MMR_2'
                WHEN cv.OPV_5 = ? THEN 'OPV_5'
                WHEN cv.HPV_1 = ? THEN 'HPV_1'
                WHEN cv.HPV_2 = ? THEN 'HPV_2'
                WHEN cv.aTd = ? THEN 'aTd'
              END as vaccine_name,
              CASE 
                WHEN cv.BCG = ? THEN cv.BCG
                WHEN cv.OPV_1 = ? THEN cv.OPV_1
                WHEN cv.fIPV_1 = ? THEN cv.fIPV_1
                WHEN cv.OPV_2 = ? THEN cv.OPV_2
                WHEN cv.fIPV_2 = ? THEN cv.fIPV_2
                WHEN cv.OPV_3 = ? THEN cv.OPV_3
                WHEN cv.MMR_1 = ? THEN cv.MMR_1
                WHEN cv.JE_1 = ? THEN cv.JE_1
                WHEN cv.OPV_4 = ? THEN cv.OPV_4
                WHEN cv.MMR_2 = ? THEN cv.MMR_2
                WHEN cv.OPV_5 = ? THEN cv.OPV_5
                WHEN cv.HPV_1 = ? THEN cv.HPV_1
                WHEN cv.HPV_2 = ? THEN cv.HPV_2
                WHEN cv.aTd = ? THEN cv.aTd
              END as vaccine_date
       FROM child_vaccination cv
       JOIN children c ON cv.child_id = c.child_id
       WHERE (cv.BCG = ? OR cv.OPV_1 = ? OR cv.fIPV_1 = ? OR cv.OPV_2 = ? OR 
              cv.fIPV_2 = ? OR cv.OPV_3 = ? OR cv.MMR_1 = ? OR cv.JE_1 = ? OR 
              cv.OPV_4 = ? OR cv.MMR_2 = ? OR cv.OPV_5 = ? OR cv.HPV_1 = ? OR 
              cv.HPV_2 = ? OR cv.aTd = ?)
       AND (cv.BCG IS NOT NULL OR cv.OPV_1 IS NOT NULL OR cv.fIPV_1 IS NOT NULL OR 
            cv.OPV_2 IS NOT NULL OR cv.fIPV_2 IS NOT NULL OR cv.OPV_3 IS NOT NULL OR 
            cv.MMR_1 IS NOT NULL OR cv.JE_1 IS NOT NULL OR cv.OPV_4 IS NOT NULL OR 
            cv.MMR_2 IS NOT NULL OR cv.OPV_5 IS NOT NULL OR cv.HPV_1 IS NOT NULL OR 
            cv.HPV_2 IS NOT NULL OR cv.aTd IS NOT NULL)`,
      [
        tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr,
        tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr,
        tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr,
        tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr,
        tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr,
        tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr,
        tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr,
        tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr,
        tomorrowStr, tomorrowStr, tomorrowStr, tomorrowStr
      ]
    );

    // Format the notifications
    const notifications = rows.map(row => ({
      child_id: row.child_id,
      child_name: `${row.first_name} ${row.last_name}`,
      vaccine_name: row.vaccine_name,
      vaccine_date: row.vaccine_date,
      parent_email: row.email,
      message: `Reminder: ${row.first_name} ${row.last_name} has a ${row.vaccine_name} vaccination scheduled for tomorrow (${row.vaccine_date})`
    }));

    // Store notifications in database for in-app display
    if (notifications.length > 0) {
      for (const notification of notifications) {
        try {
          await pool.execute(
            `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
            [notification.child_id, notification.message]
          );
        } catch (dbError) {
          console.error("Error storing notification in database:", dbError.message);
        }
      }
      console.log(`Stored ${notifications.length} notifications in database`);
    }

    return res.json({
      success: true,
      date: tomorrowStr,
      notifications: notifications,
      count: notifications.length
    });

  } catch (err) {
    console.error("getVaccinationNotifications error:", err?.message);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to fetch vaccination notifications" 
    });
  }
};

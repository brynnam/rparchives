from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import json

YOUR_USERNAME = "hiiiii"

def parse_rp_export(html_file):
    with open(html_file, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    messages = []
    message_divs = soup.find_all("div", class_="pam _3-95 _2ph- _a6-g uiBoxWhite noborder")

    last_time = None
    time_increment = timedelta(seconds=1)

    for div in message_divs:
        # Sender
        h2 = div.find("h2")
        if not h2:
            continue
        sender_raw = h2.get_text(strip=True)
        sender = "you" if sender_raw.lower() == YOUR_USERNAME.lower() else "partner"

        # Message text
        msg_container = div.find("div", class_="_3-95 _a6-p")
        if not msg_container:
            continue
        text = ""
        for child in msg_container.find_all("div", recursive=False):
            text_candidate = child.get_text(strip=True)
            if text_candidate:
                text = text_candidate
                break

        # Timestamp
        time_div = div.find("div", class_="_3-94 _a6-o")
        if not time_div:
            continue
        time_str = time_div.get_text(strip=True)

        # Parse timestamp
        try:
            time_obj = datetime.strptime(time_str, "%b %d, %Y %I:%M %p")
        except ValueError:
            print(f"Warning: Could not parse time '{time_str}', skipping.")
            continue

        # Ensure strictly increasing time while preserving DOM order
        if last_time and time_obj <= last_time:
            time_obj = last_time + time_increment
        last_time = time_obj

        messages.append({
            "sender": sender,
            "text": text,
            "time": time_obj.isoformat()
        })

    return messages


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python convert_rp.py path/to/rp-export.html")
        sys.exit(1)

    html_path = sys.argv[1]
    messages = parse_rp_export(html_path)
    print(f"Parsed {len(messages)} messages in DOM order with fixed timestamps.")

    with open("rp_data.json", "w", encoding="utf-8") as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)

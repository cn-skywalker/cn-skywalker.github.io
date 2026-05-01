# Leaflet cluster map of talk locations
#
# Run this from the _talks/ directory, which contains .md files of all your
# talks. This scrapes the location YAML field from each .md file, geolocates it
# with Gaode (Amap) API, and uses the getorg library to output data, HTML, and
# Javascript for a standalone cluster map. This is functionally the same as the
# talkmap Jupyter notebook.
import frontmatter
import glob
import getorg
import requests

AMAP_KEY = "80299a2a170b98e41825e805499c55a1"

# Collect the Markdown files
g = glob.glob("_talks/*.md")

# Prepare to geolocate
location_dict = {}
location = ""
permalink = ""
title = ""


def gaode_geocode(address, timeout=5):
    """Use Gaode (Amap) geocoding API to get coordinates."""
    url = "https://restapi.amap.com/v3/geocode/geo"
    params = {"key": AMAP_KEY, "address": address, "output": "JSON"}
    resp = requests.get(url, params=params, timeout=timeout)
    data = resp.json()
    if data.get("geocodes"):
        lon, lat = data["geocodes"][0]["location"].split(",")
        return float(lat), float(lon)
    return None


# Perform geolocation
for file in g:
    data = frontmatter.load(file)
    data = data.to_dict()

    if "location" not in data:
        continue

    title = data["title"].strip()
    venue = data["venue"].strip()
    location = data["location"].strip()
    description = f"{title}<br />{venue}; {location}"

    try:
        coords = gaode_geocode(location)
        if coords:
            location_dict[description] = type("Location", (), {"latitude": coords[0], "longitude": coords[1]})()
            print(f"{description} -> ({coords[0]}, {coords[1]})")
        else:
            print(f"Error: geocode returned no results for {location}")
    except Exception as ex:
        print(f"An unhandled exception occurred while processing input {location} with message {ex}")

# Save the map
m = getorg.orgmap.create_map_obj()
getorg.orgmap.output_html_cluster_map(location_dict, folder_name="talkmap", hashed_usernames=False)

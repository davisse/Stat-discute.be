
import re
import sys

def parse_markdown(content):
    """
    Parses the content of a single markdown file and returns a formatted string.
    """
    formatted_string = ""

    # Endpoint Name
    endpoint_name_match = re.search(r"# (.*)", content)
    if endpoint_name_match:
        endpoint_name = endpoint_name_match.group(1)
        formatted_string += f"## {endpoint_name}\n\n"

    # Endpoint URL
    endpoint_url_match = re.search(r"##### Endpoint URL\n>\\\[(.*)\\]", content)
    if endpoint_url_match:
        endpoint_url = endpoint_url_match.group(1)
        formatted_string += f"**Endpoint URL:** `{endpoint_url}`\n\n"

    # Valid URL
    valid_url_match = re.search(r"##### Valid URL\n>\\\[(.*)\\]", content)
    if valid_url_match:
        valid_url = valid_url_match.group(1)
        formatted_string += f"**Valid URL:** `{valid_url}`\n\n"

    # Parameters
    parameters_match = re.search(r"## Parameters\n([\s\S]*?)\n## Data Sets", content)
    if parameters_match:
        parameters_table = parameters_match.group(1)
        formatted_string += f"### Parameters\n\n{parameters_table}\n\n"

    # Data Sets
    data_sets_match = re.search(r"## Data Sets\n([\s\S]*?)\n## JSON", content)
    if data_sets_match:
        data_sets_content = data_sets_match.group(1)
        # Split into individual data sets
        data_sets = re.split(r"#### (.*?)\n", data_sets_content)
        if len(data_sets) > 1:
          formatted_string += "### Data Sets\n\n"
          for i in range(1, len(data_sets), 2):
              data_set_name = data_sets[i]
              data_set_values = data_sets[i+1].strip()
              formatted_string += f"**{data_set_name}**\n\n```\n{data_set_values}\n```\n\n"

    return formatted_string

def process_files(file_path):
    """
    Processes a file with multiple markdown contents and returns a single formatted string.
    """
    with open(file_path, 'r') as f:
        content = f.read()

    # Split the content by the separator
    files = content.split("---")
    
    all_formatted_content = ""
    for file_content in files:
        if file_content.strip():
            all_formatted_content += parse_markdown(file_content)
            all_formatted_content += "---\n\n"

    return all_formatted_content

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python process_markdown.py <path_to_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    formatted_output = process_files(file_path)
    print(formatted_output)

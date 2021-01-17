import re


# Main function for getting dependencies
def checkFile(filename):
    names = get_file_and_path(filename)
    depDict = {"filename": names["filename"],
            "path": names["path"], "body": []}

    with open(filename, 'r') as file:
        for line in file.read().splitlines():
            if (filename.endswith(".py")):
                pythonCheck(line, depDict)
            elif (filename.endswith(".java")):
                javaCheck(line, depDict)
            elif (filename.endswith(".js")):
                javaScriptCheck(line, depDict)

    return depDict


# Given a filename, return an object with the filename and directory path.
# If no directory path found, return "/" as the path.
def get_file_and_path(filename):
    split = filename.split("/", 1)
    # If unzipped file
    if split[0]=="unzip_area":
        fullPath = split[1].split("/", 1)[1]
        zipSplit = fullPath.rsplit("/", 1)
        return {"filename": zipSplit[1], "path": zipSplit[0]}
    else:
        return {"filename": split[1], "path": "/"}

# Check for modules in line of python.
# Checks for:
# import X
# from X import *
# from X import a, b, c
# X = __import__('X')
def pythonCheck(line, depDict):
    # line = line.decode("utf-8")
    regEx = re.compile('''['"](.*)import(.*)["']''')

    if "import" in line:
        # Remove line if "import" in string
        val = re.search(regEx, line)
        if val:
            return

        line = line.split("#")[0]  # Remove comments.
        line = line.strip()  # Remove trailing whitespace and newline.

        # If line was a comment.
        if line == "":
            return

        # If line isn't import line.
        if "import" not in line:
            return

        # Get module from "__import__".
        if "__import__" in line:
            # Need to account for all the different characters that could be in
            # a package name
            string = re.findall(
                '''__import__[(][ ]*["'][a-zA-Z_.0-9-]*["'][ ]*[)]''', line)
            string = re.findall(
                '''[(][ ]*["'][a-zA-Z_.0-9-]*["'][ ]*[)]''', string[0])

            # Get rid of all whitespace
            string = string[0][1:-1]
            string = string.strip()
            string = string[1:-1]
            string = string.strip()
            depDict["body"].append({"name": string})
            return

        noAs = re.split(" as ", line)
        modules = re.split(" |, ", noAs[0])

        ifFrom = False  # If from is part of the line
        baseModule = ""  # Name of base module
        # Get remaining modules, one or more.
        for string in modules:
            # Splitting by " " means that superfluous spaces in the import line
            # get counted as separate dependencies. This check prevents that.
            if string == "":
                continue
            if string == "from":
                ifFrom = True
                continue
            if string == "import":
                continue
            if baseModule == "" and ifFrom == True:
                baseModule = string
                continue
            else:
                if ifFrom == True:
                    # Store x.* as x
                    if "*" in string:
                        string = baseModule
                    else:
                        string = baseModule + "." + string

            depDict["body"].append({"name": string})


# Check for modules in line of Java.
# Checks for:
# import a.a
# import a.a.*
def javaCheck(line, depDict):
    # line = line.decode("utf-8")
    regEx = re.compile('''['"](.*)import(.*)["']''')

    if "import" in line:
        # Remove line if "import" in string
        val = re.search(regEx, line)
        if val:
            return

        line = line.split("//")[0]  # Remove comments.
        line = line.strip()  # Remove trailing whitespace and newline.

        # If line was a comment.
        if line == "":
            return

        # If line isn't import line.
        if "import" not in line:
            return

        # Remove "import" from line
        line = line[6:-1]
        line = line.strip()

        if "*" in line:
            line = line[:-2]

        depDict["body"].append({"name": line})


# Check for modules in line of JavaScript
# Checks for:
# import "module-name";
# import * as name from "module-name";
# import defaultExport from "module-name";
# import { export1 } from "module-name";
# import { export1 , export2 } from "module-name";
# import { foo , bar } from "module-name/path/to/specific/un-exported/file";
# import defaultExport, { export1 [ , [...] ] } from "module-name";
# import defaultExport, * as name from "module-name";
# var promise = import("module-name");
# var promise = require("module-name");
def javaScriptCheck(line, depDict):
    # line = line.decode("utf-8")
    regEx = re.compile('''['"](.*)import(.*)["']''')
    bracketRegEx = re.compile('''[(](.*)[)]''')

    if "import" in line:
        # Remove line if "import" in string
        val = re.search(regEx, line)
        if val:
            return

        line = line.split("//")[0]  # Remove comments.
        line = line.strip()  # Remove trailing whitespace and newline.

        # If line was a comment.
        if line == "":
            return

        # If line is in "import('module')" format
        if "(" in line and "import" in line:
            line = re.findall(bracketRegEx, line)[0]
            line = line.replace("\'", "")
            line = line.replace("\"", "")
            line = line.strip()
            depDict["body"].append({"name": line})
            return

        # If line isn't import line.
        if "import" not in line:
            return

        line = line.replace("\'", "")
        line = line.replace(";", "")
        line = line.replace("\"", "")
        line = line.strip()

        baseModule = ""
        ifFrom = False
        if " from " in line:
            ifFrom = True
            noFrom = re.split(" from ", line)
            baseModule = noFrom[1]
            line = noFrom[0]

        # Remove "import" from line
        line = line[6:]
        line = line.strip()

        # If import line is in format of 'import "module"', the name of the
        # module will just be in line.
        if not ifFrom:
            baseModule = line

        depDict["body"].append({"name": baseModule})
    elif "require" in line:
        regEx = re.compile('''['"](.*)require(.*)["']''')

        # Remove line if "require" in string
        val = re.search(regEx, line)
        if val:
            return

        line = line.split("//")[0]  # Remove comments.
        line = line.strip()  # Remove trailing whitespace and newline.

        # If line was a comment.
        if line == "":
            return

        if "(" in line and "require" in line:
            line = re.findall(bracketRegEx, line)[0]
            line = line.replace("\'", "")
            line = line.replace("\"", "")
            line = line.strip()
            depDict["body"].append({"name": line})

function openMessageData()
{


    var sb = "";
    var q, answer = "";
    //sb += "<div class=\"MessageDataChecklist\">&lt;sr-data version-ckey=\"" + document.getElementById("checklistversionckey").value;
    //sb += "\" display-name=\"" + document.getElementById("checklisttitle").value + "\"&gt;</div>";
    //var elem = document.getElementById("checklist").elements;
    var elem = document.getElementById("checklist").elements;

    for (var i = 0; i < elem.length; i++)
    {
        q = "";
        var name = elem[i].name;

        var value;

      if (name.indexOf("q") == 0)
        {

			value = elem[i].value;
			answer = GetAnswer(name.replace("q", ""));
			if(answer!="")
			{
					q += "<div class=\"MessageDataQuestion\">&lt;question ID=\"" + name.replace("q", "") + "\" display-name=\"" + value + "\"";
					q += "&gt;<br><div class=\"MessageDataAnswer\">" + answer + "</div>&lt;/question&gt;</div>";

			}
            sb += q;
		    answer ="";
        }
    }
    sb="<div class=\"MessageDataChecklist\">&lt;response&gt;" + sb + "&lt;/response&gt;</div>"
    //sb += "<div class=\"MessageDataChecklist\">&lt;/sr-data&gt;</div>";
    document.getElementById('MessageDataResult').innerHTML = sb;
    document.getElementById('MessageData').style.display = 'block';
    document.getElementById('FormData').style.display = 'none';
}

function closeMessageData()
{
    document.getElementById('MessageData').style.display = 'none';
    document.getElementById('FormData').style.display = 'block';
}

function GetAnswer(qCkey)
{
    var elem = document.getElementById("checklist").elements;
    var str = "";
    var name, value;

    for(var i = 0; i < elem.length; i++)
    {
        name = elem[i].name;
        value = elem[i].value;
        //if(i<3)
        //  alert("name: " + name + ", value: " + value + ", qCkey: " + qCkey);

        if (name.indexOf(qCkey) == 0)
        //if (name==qCkey)
        {

           if (elem[i].checked || (elem[i].type == "text" && value != ""))
            {

                {

                    var k = value.split(',');

                    if(elem[i].type == "text" && value != "")
		    		{
						str += "&lt;value = \"" + value + "\"/&gt;<br>";
		    		}
                    else if(elem[i].type != "text")
		    		{
                    	str += "&lt;answer ID=\"" + k[0] + "\" display-name=\"" + GetDisplayName(value) + "/&gt;<br>";
		    		}
                }
            }
        }
    }
    return str;
}

function GetDisplayName(value)
{
    var strArray = value.split(',');
    var returnStr = "";
    if (strArray.length > 1) {
        for (var i = 1; i < strArray.length; i++) {
            if (i != strArray.length) {
                returnStr += strArray[i] + ",";
            }
            else {
                returnStr += strArray[i];
            }
        }
    }
    return returnStr.substr(0, returnStr.length-1);
}
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    version="1.0" xmlns:sr="http://www.cap.org/pert/2009/01/">
	
  <xsl:output method="html" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/>
	
  <xsl:variable name="form-action" select="document('sr-service.xml')/sr:sr-service"/>
	<xsl:variable name="show-toc" select="'false'"/>
	<xsl:variable name="sct-code" select="document('sct-codes.xml')/sr:concept-descriptors"/>
	<xsl:variable name="template-links" select="document('sr-toc.xml')/sr:template-toc"/>
	<xsl:variable name="debug" select="'false'"/>
	
	<xsl:template match="/">
		<!--<xsl:variable name="required" select="string(//sr:template/required)"/>-->
		<xsl:variable name ="required" select="string(//Header/OtherText[@type='web_posting_date meta']/@val)"/>
        <html>
            <head>
			
			<script type="text/javascript" src="/form/public/assets/sdc/sdctemplate.js"/>
			<link rel="stylesheet" href="/form/public/assets/sdc/sdctemplate.css" type="text/css" />
            </head>
            <body align="left">
				<xsl:if test="$show-toc='true' and count($template-links/template-link) &gt; 0">
					<div style="width:250px;height:600px;float:left;margin:10px;padding-left:10px;padding-right:20px">
						<xsl:apply-templates select="$template-links"/>
						<br/>
						<p/>
					</div>
				</xsl:if>
				<div class="BodyGroup">
					<xsl:if test="$show-toc='true' and count($template-links/template-link) &gt; 0">
						<xsl:attribute name="style">
							<xsl:text>float:left</xsl:text>
						</xsl:attribute>
					</xsl:if>
					
					<div id="MessageData" style="display:none;">
						<table class="HeaderGroup" align="center">
							<tr>
								<td>
									<div class="TopHeader">
										Structured Report Data
									</div>
									<div id="MessageDataResult" class="MessageDataResult"/>
									<div class="SubmitButton">
										<input type="button" value="Back" onClick="javascript:closeMessageData()" />
									</div>
								</td>
							</tr>
						</table>
					</div>
					
					<div id="FormData">
						<form id="checklist" name="checklist" method="post" >
							<xsl:attribute name="action">
								<xsl:value-of select="$form-action"/>
							</xsl:attribute>
							
							<!--show header-->
							<xsl:variable name="title_style" select="//Header/@styleClass"/>
							<xsl:variable name='title_id' select="//Header/@ID"/>
							<div ID = '{$title_id}' class="{$title_style}">
								<xsl:value-of select="//Header/@title"/>
							</div>
							
							
							<xsl:for-each select="//Header/OtherText">
								<xsl:variable name="textstyle" select="@styleClass"/>
								
								<div class='{$textstyle}'>
									<!--meta data specific labels-->
									<xsl:choose>
										<xsl:when test="@type='AJCC_UICC_Version meta'">
											AJCC UICC Version:
										</xsl:when>
										<xsl:when test="@type='CS'">
											CS Version:
										</xsl:when>
										<xsl:when test="@type='web_posting_date meta'">
											Protocol web posting date:
										</xsl:when>
									</xsl:choose>
									<!--do not show approval status as it is repeated-->
									<xsl:if test="@type!='approval-status meta'">
										<xsl:value-of select="@val"/>
									</xsl:if>
									
								</div>
								<div style="clear:both"/>
							</xsl:for-each>
							
							
							<!--show body-->
							<xsl:apply-templates select="//Body/ChildItems/Section" >
								<xsl:with-param name="required" select="$required" />
							</xsl:apply-templates>
							<xsl:apply-templates select="//Body/ChildItems/Question" mode="level2" >
								<xsl:with-param name="required" select="$required" />
							</xsl:apply-templates>
							
							<xsl:if test="contains($form-action, 'http') or contains($form-action, 'javascript')">
								<div class="SubmitButton">
									<input type="submit" value="Submit"/>
								</div>
							</xsl:if>
						</form>
					</div>
				</div>
            </body>
        </html>
    </xsl:template>
   
    <xsl:template match="//Header">
       
       
    </xsl:template>
	
	<xsl:template match="Section">
		<xsl:if test="not (@visible) or (@visible='true')">
    	<xsl:variable name="required" select="true"/>
		<xsl:variable name="style" select="@styleClass"/>
		<xsl:variable name="defaultStyle" select="'TopHeader'"/>	
		<table class="HeaderGroup" align="center">
			<tr>
				<td>
					<xsl:choose>
						<xsl:when test="$style!=''">
							<div class="{$style}">
								<xsl:value-of select="@title"/>
							</div>
						</xsl:when>
						<xsl:otherwise>
							<div class="{$defaultStyle}">
								<xsl:value-of select="@title"/>
							</div>
						</xsl:otherwise>
					</xsl:choose>
			
					<div>
						<xsl:choose>
							<xsl:when test="$required='false'">
								
							</xsl:when>
							<xsl:otherwise>								
								<xsl:apply-templates select="ChildItems/Question" mode="level1" >
									<xsl:with-param name="required" select="'true'"/>
								</xsl:apply-templates>
								<xsl:apply-templates select="ChildItems/Section" >
									<xsl:with-param name="required" select="'true'"/>
								</xsl:apply-templates>
							</xsl:otherwise>
						</xsl:choose>
					</div>
					<div style="clear:both"/>
				</td>
			</tr>
		</table>
		
		</xsl:if>
	</xsl:template>
	
	<!--question in section-->
	<xsl:template match="Question" mode="level1">
		<xsl:variable name="questionid" select="@ID"/>
    
    <input type="hidden" class="TextBox">
      <xsl:attribute name="name">
        <xsl:value-of select="concat('q',$questionid)"/>
      </xsl:attribute>
      <xsl:attribute name="value">
        <xsl:value-of select="@title"/>
      </xsl:attribute>
    </input>
    
		<div class="QuestionInSection">   <!--two columns-->
			<div class="QuestionTitle">
				<xsl:value-of select="@title"/>
				<xsl:if test="ResponseField">
					<input type="text" class="TextBox">
						<xsl:attribute name="name">
							<xsl:value-of select="$questionid"/>
						</xsl:attribute>
					</input>
				</xsl:if>
			</div>
			<div style="clear:both;"/>
			<xsl:if test="ListField">
			  <xsl:apply-templates select="ListField" mode="level1">
					  <xsl:with-param name="questionid" select="$questionid" />
        </xsl:apply-templates>
			</xsl:if>
		</div>
		
	</xsl:template>

	
	<!--question in list item-->
	<xsl:template match="Question" mode="level2">
		<xsl:variable name="questionid" select="@ID"/>
    <input type="hidden" class="TextBox">
      <xsl:attribute name="name">
        <xsl:value-of select="concat('q',$questionid)"/>
      </xsl:attribute>
      <xsl:attribute name="value">
        <xsl:value-of select="@title"/>
      </xsl:attribute>
    </input>
    
		<div class="QuestionInListItem"> 
			<!--not showing the hidden question-->
			<xsl:if test="string-length(@title)&gt;0">
			<div class="QuestionTitle">
				<xsl:value-of select="@title"/>
				
				<xsl:if test="ResponseField">
				<input type="text" class="TextBox">
					<xsl:attribute name="name">
						<xsl:value-of select="$questionid"/>
					</xsl:attribute>
				</input>
			</xsl:if>
		</div>
		</xsl:if>
		<div style="clear:both;"/>
			<xsl:if test="ListField">
       
				<xsl:apply-templates select="ListField" mode="level1">
					<xsl:with-param name="questionid" select="$questionid" />
        </xsl:apply-templates>
                           	
			</xsl:if>
		</div>

	</xsl:template>
	
<xsl:template match="Body/ChildItems/Question">
  <xsl:variable name="questionid" select="@ID"/>
  <input type="hidden" class="TextBox">
    <xsl:attribute name="name">
      <xsl:value-of select="concat('q',$questionid)"/>
    </xsl:attribute>
    <xsl:attribute name="value">
      <xsl:value-of select="@title"/>
    </xsl:attribute>
  </input>
  <xsl:value-of select="@title"/>: 
	<input type="text">
		<xsl:attribute name="name">
					<xsl:value-of select="questionid"/>
    </xsl:attribute>
		
	</input><br/>
	
</xsl:template>


<xsl:template match="ListField" mode="level1">
   <xsl:param name="questionid" />
     
	<xsl:choose>
		<!--multiselect-->
		<xsl:when test="@multiSelect='true'">
			<xsl:for-each select="List/ListItem">
				<div class="Answer">
					<input type="checkbox" style="float:left;">
						<xsl:attribute name="name">
              				<xsl:value-of select="$questionid"/>
						</xsl:attribute>
						<xsl:attribute name="value">
							<xsl:value-of select="@ID"/>,<xsl:value-of select="@title"/>
						</xsl:attribute>
					</input>
					<xsl:value-of select="@title"/>
						
					<xsl:if test="ListItemResponseField">
						<input type="text" class="AnswerTextBox">
						    <xsl:attribute name="name">
								<xsl:value-of select="$questionid"/>
						    </xsl:attribute>
							
						</input>
					</xsl:if>
				</div>
				<!--question within list-->
				<xsl:apply-templates select="ChildItems/Question" mode="level2"/>
			</xsl:for-each>
		</xsl:when>
	
		<!--single select-->
		<xsl:otherwise>
			<xsl:for-each select="List/ListItem">
				<div class="Answer">
					<input type="radio" style="float:left">
						<xsl:attribute name="name">
              				<xsl:value-of select="$questionid"/>
						</xsl:attribute>
						<xsl:attribute name="value">
							<xsl:value-of select="@ID"/>,<xsl:value-of select="@title"/>
						</xsl:attribute>
					</input>
					<xsl:value-of select="@title"/>
					<!--answer fillin-->
					<xsl:if test="ListItemResponseField">
						<input type="text" class="AnswerTextBox">
							<xsl:attribute name="width">
								<xsl:value-of select="100"/>
							</xsl:attribute>
							<xsl:attribute name="name">
								<xsl:value-of select="$questionid"/>
							</xsl:attribute>
						</input>
					</xsl:if>
				</div>
				<!--question within list-->
				<xsl:apply-templates select="ChildItems/Question" mode="level2"/>
			</xsl:for-each>
		</xsl:otherwise>
		
	</xsl:choose>

</xsl:template>

</xsl:stylesheet>
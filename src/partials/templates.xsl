<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template name="info-content">
		<div class="head">
			<xsl:call-template name="head-content"/>
		</div>
		<div class="details">
			
			<legend class="expanded" data-click="toggle-wrapper">
				<i class="icon-chevron-right"></i>
				General
			</legend>
			<div class="wrapper general">
				<xsl:call-template name="general-wrapper"/>
			</div>

			<xsl:if test="@kind != '_dir' and @kind != 'app'">
				<legend class="expanded" data-click="toggle-wrapper">
					<i class="icon-chevron-right"></i>
					Open this kind with
				</legend>
				<div class="wrapper open-with" data-section="sharing">
					<xsl:call-template name="open-with-wrapper"/>
				</div>
			</xsl:if>

			<legend class="expanded2" data-click="toggle-wrapper">
				<i class="icon-chevron-right"></i>
				Preview
			</legend>
			<div class="wrapper preview">
				<xsl:call-template name="preview-wrapper"/>
			</div>

			<legend class="expanded" data-click="toggle-wrapper">
				<i class="icon-chevron-right"></i>
				Sharing &amp; Permissions
			</legend>
			<div class="wrapper sharing" data-section="sharing">
				<xsl:call-template name="sharing-wrapper"/>
			</div>

		</div>
	</xsl:template>


	<xsl:template name="head-content">
		<div class="icon">
			<xsl:variable name="itemPath"><xsl:call-template name="sys:get-file-path"/></xsl:variable>
			<div class="item-icon">
				<xsl:choose>
					<xsl:when test="(//Mime/*[@id=current()/@kind]/@preview = 'image' or //Mime/*[@id=current()/@kind]/@preview = 'svg') and substring( @mode, 1, 1 ) != 'l'">
						<i class="item-image">
							<xsl:attribute name="style">background-image: url(/fs<xsl:value-of select="$itemPath"/>?w=232&amp;h=148);</xsl:attribute>
						</i>
					</xsl:when>
					<xsl:when test="@kind = 'app'">
						<i class="app-icon">
							<xsl:attribute name="style">background-image: url(/app/<xsl:value-of select="@ns"/>/icons/app-icon-<xsl:value-of select="@id"/>.png);</xsl:attribute>
						</i>
					</xsl:when>
					<xsl:otherwise>
						<xsl:call-template name="sys:icon-type">
							<xsl:with-param name="hiRes" select="1"/>
						</xsl:call-template>
						<xsl:if test="@kind != '_dir'">
							<span><xsl:call-template name="sys:icon-kind"/></span>
						</xsl:if>
					</xsl:otherwise>
				</xsl:choose>
			</div>
		</div>
		<div class="info">
			<h2 class="value-name"><xsl:value-of select="@name"/></h2>
			<h3 class="value-size">
				<xsl:choose>
					<xsl:when test="@kind = '_dir'">
						<xsl:call-template name="sys:folder-size"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:call-template name="sys:file-size">
							<xsl:with-param name="bytes" select="@size" />
							<xsl:with-param name="kind" select="@kind" />
						</xsl:call-template>
					</xsl:otherwise>
				</xsl:choose>
			</h3>
		</div>
	</xsl:template>


	<xsl:template name="general-wrapper">
		<ul>
			<li>
				<span>Kind</span>
				<span class="value-kind">
					<xsl:value-of select="//Mime/*[@id=current()/@kind]/@name"/>
					<xsl:if test="substring( @mode, 1, 1 ) != 'd'"> file</xsl:if>
				</span>
			</li>
			<li>
				<span>Size</span>
				<span class="value-size">
					<xsl:choose>
						<xsl:when test="@kind = '_dir'">
							<xsl:number value="sum(.//@size)" grouping-size="3" grouping-separator=" "/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:number value="@size" grouping-size="3" grouping-separator=" "/>
						</xsl:otherwise>
					</xsl:choose> bytes
				</span>
			</li>
			<xsl:if test="@kind = '_dir'">
				<li>
					<span>Content</span>
					<span class="value-content">
						<xsl:choose>
							<xsl:when test="count(.//*) = 0">Empty</xsl:when>
							<xsl:otherwise>
								<xsl:value-of select="count(.//*)"/> items
							</xsl:otherwise>
						</xsl:choose>
					</span>
				</li>
			</xsl:if>
			<li>
				<span>Where</span>
				<span class="value-path">~<xsl:call-template name="sys:get-file-path"/></span>
			</li>
			<li>
				<span>Modified</span>
				<span class="value-lastModified"><xsl:call-template name="sys:fileModified"/></span>
			</li>
			<li class="divider"></li>
			<xsl:if test="@kind = 'app'">
				<xsl:variable name="xApp" select="/ledger/Settings/Apps/i[@ns=current()/@ns][@id=current()/@id]"/>
				<li>
					<span>Version</span>
					<span class="value-version"><xsl:value-of select="$xApp/@version"/></span>
				</li>
				<li>
					<span>Author</span>
					<span class="value-author"><xsl:value-of select="$xApp/@author"/></span>
				</li>
			</xsl:if>
			<xsl:if test="@kind != 'app'">
				<li>
					<span>Owner</span>
					<span class="value-owner"><xsl:value-of select="/ledger/Settings/User/@name"/></span>
				</li>
			</xsl:if>
		</ul>
	</xsl:template>


	<xsl:template name="open-with-wrapper">
		<ul>
			<li class="has-selectbox">
				<span>Apply for all</span>
				<span>
					<selectbox>
						<!-- <option selected="1">Text Edit</option> -->
						<xsl:for-each select="//Mime/*[@id=current()/@kind]/*">
							<xsl:variable name="xApp" select="/ledger/Settings/Apps/i[@ns=current()/@ns][@id=current()/@id]"/>
							<option class="prefix-icon" value="ant:textedit">
								<xsl:attribute name="style">--icon-prefix: url(/app/<xsl:value-of select="$xApp/@ns"/>/icons/app-icon-<xsl:value-of select="$xApp/@id"/>.png);</xsl:attribute>
								<xsl:if test="position() = 1"><xsl:attribute name="selected">1</xsl:attribute></xsl:if>
								<xsl:value-of select="$xApp/@name"/>
							</option>
						</xsl:for-each>
					</selectbox>
				</span>
			</li>
		</ul>
	</xsl:template>


	<xsl:template name="preview-wrapper">
		<xsl:choose>
			<xsl:when test="//Mime/*[@id=current()/@kind]/@preview = 'image' or //Mime/*[@id=current()/@kind]/@preview = 'svg'">
				<div class="preview-box preview-image">
					<xsl:attribute name="style">background-image: url(/fs<xsl:call-template name="sys:get-file-path"/>?w=232&amp;h=148);</xsl:attribute>
				</div>
			</xsl:when>
			<xsl:when test="//Mime/*[@id=current()/@kind]/@preview = 'text'">
				<pre class="preview-box preview-text">
					<xsl:attribute name="data-path"><xsl:call-template name="sys:get-file-path"/></xsl:attribute>
					<xsl:choose>
						<xsl:when test="//dfs/*[@path = $itemPath]">
							<xsl:value-of select="//dfs/*[@path = $itemPath]" disable-output-escaping="yes"/>
						</xsl:when>
						<xsl:otherwise>
							<svg class="loader" viewBox="25 25 50 50" >
								<circle class="loader-path" cx="50" cy="50" r="20" />
							</svg>
						</xsl:otherwise>
					</xsl:choose>
				</pre>
			</xsl:when>
			<xsl:otherwise>
				<div class="preview-box preview-icon">
					<xsl:call-template name="sys:icon-type">
						<xsl:with-param name="hiRes" select="1"/>
					</xsl:call-template>
				</div>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>


	<xsl:template name="sharing-wrapper">
		<ul>
			<li class="list">

				<div class="list_">
					<div class="list-header_">
						<span>Name</span>
						<span>Privelege</span>
					</div>
					<div class="list-body_" data-click="select-list-row">

						<div class="list-row_" data-id="me">
							<span>
								<i class="icon-user"></i>
								<span><xsl:value-of select="/ledger/Settings/User/@name"/> (me)</span>
							</span>
							<span>
								<i class="icon-sort" data-menu="select-privelege"></i>
								<span>Read &amp; Write</span>
							</span>
						</div>

						<div class="list-row_" data-id="everybody">
							<span>
								<i class="icon-group"></i>
								<span>Everybody</span>
							</span>
							<span>
								<i class="icon-sort" data-menu="select-privelege"></i>
								<span>No Access</span>
							</span>
						</div>

					</div>
				</div>

			</li>
			<li class="footer">
				<div class="option-buttons_">
					<span data-menu="sys:users.select-user">
						<xsl:if test="@kind = 'app'">
							<xsl:attribute name="class">disabled_</xsl:attribute>
						</xsl:if>
						<span class="icon-plus"></span>
					</span>
					<span class="disabled_" data-click="remove-user">
						<span class="icon-minus"></span>
					</span>
					<span data-menu="apply-action">
						<xsl:if test="@kind = 'app'">
							<xsl:attribute name="class">disabled_</xsl:attribute>
						</xsl:if>
						<span class="icon-action-apply"></span>
					</span>
				</div>

				<xsl:if test="@kind != 'app'">
					<i data-click="unlock-actions" class="icon-padlock"></i>
				</xsl:if>
			</li>
		</ul>
	</xsl:template>

</xsl:stylesheet>
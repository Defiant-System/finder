<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="sideBar">
	<xsl:for-each select="./*">
		<div class="wrapper">
			<legend>
				<xsl:value-of select="@name"/>
				<span class="btn-toggle" data-click="toggle-sidebar-block" toggle-text="Show">Hide</span>
			</legend>
			<div class="list-wrapper">
				<ul>
					<xsl:for-each select="./*">
					<li data-click="get-sidebar-item">
						<xsl:if test="@path = //Settings//*[@id = 'defaultPath']/@value">
							<xsl:attribute name="class">active</xsl:attribute>
						</xsl:if>
						<xsl:attribute name="data-path"><xsl:value-of select="@path"/></xsl:attribute>
						<span class="sidebar-icon">
							<xsl:attribute name="style">background-image: url(~/icons/sidebar-<xsl:value-of select="@icon"/>.png);</xsl:attribute>
							<title><xsl:value-of select="@name"/></title>
						</span>
						<span class="name"><xsl:value-of select="@name"/></span>
					</li>
					</xsl:for-each>
				</ul>
			</div>
		</div>
	</xsl:for-each>
</xsl:template>

<xsl:template name="fileView">
	<xsl:choose>
		<xsl:when test="//Settings/i[@app-id = 'finder']/i[@id = 'fileView' and @value = 'columns']">
			<div class="column right-resize" data-click="select-column-file" data-dblclick="open-column-file">
				<xsl:attribute name="data-path"><xsl:call-template name="sys:get-file-path"/></xsl:attribute>
				<xsl:for-each select="./*">
					<xsl:sort order="descending" select="substring( @mode, 1, 1 ) = 'd'"/>
					<xsl:sort order="ascending" select="@name"/>
					<div class="file">
						<xsl:attribute name="data-kind"><xsl:value-of select="@kind"/></xsl:attribute>
						<xsl:if test="substring( @mode, 1, 1 ) = 'l'">
							<xsl:attribute name="data-link"><xsl:value-of select="@link"/></xsl:attribute>
						</xsl:if>
						<i class="item-icon">
							<xsl:call-template name="sys:icon-kind">
								<xsl:with-param name="size" select="1" />
							</xsl:call-template>
							<xsl:if test="substring( @mode, 1, 1 ) = 'l'">
								<div class="shortcut-item" style="background-image: url(/icons/file-shortcut.png);"></div>
							</xsl:if>
						</i>
						<span class="name"><xsl:value-of select="@name"/></span>
					</div>
				</xsl:for-each>
			</div>
		</xsl:when>
		<xsl:when test="//Settings/i[@app-id = 'finder']/i[@id = 'fileView' and @value = 'list']">
			<div class="list">
				<xsl:attribute name="data-path"><xsl:call-template name="sys:get-file-path"/></xsl:attribute>
				<div class="list-header" data-order="ascending" data-click="sort-file-view-by">
					<span data-sort="@name" data-type="text" class="right-resize active ascending">Name</span>
					<span data-sort="@mStamp" data-type="number" class="right-resize">Date Modified</span>
					<span data-sort="@size" data-type="number" class="right-resize">Size</span>
					<span data-sort="@kind" data-type="text">Kind</span>
				</div>
				<div class="list-body" data-click="select-list-file" data-dblclick="open-list-file">
					<xsl:call-template name="fileView-list"/>
				</div>
			</div>
		</xsl:when>
		<xsl:otherwise>
			<div class="icons" data-click="select-icon-file" data-dblclick="open-icon-file">
				<xsl:attribute name="data-path"><xsl:call-template name="sys:get-file-path"/></xsl:attribute>
				<xsl:call-template name="fileView-icons"/>
			</div>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template name="fileView-list-with-wrapper">
	<div class="subList">
		<xsl:attribute name="data-path"><xsl:call-template name="sys:get-file-path"/></xsl:attribute>
		<div>
			<xsl:call-template name="fileView-list"/>
		</div>
	</div>
</xsl:template>

<xsl:template name="fileView-list">
	<xsl:for-each select="./*">
		<xsl:sort order="descending" select="substring( @mode, 1, 1 ) = 'd'"/>
		<xsl:sort order="ascending" select="@name"/>
		<div class="file">
			<xsl:attribute name="data-kind"><xsl:value-of select="@kind"/></xsl:attribute>
			<span class="name">
				<xsl:if test="substring( @mode, 1, 1 ) = 'd'">
					<span class="arrow-right" data-click="list-toggle-folder"></span>
				</xsl:if>
				<i class="item-icon">
					<xsl:call-template name="sys:icon-kind"/>
					<xsl:if test="substring( @mode, 1, 1 ) = 'l'">
						<div class="shortcut-item" style="background-image: url(~/icons/file-shortcut.png);"></div>
					</xsl:if>
				</i>
				<span><xsl:value-of select="@name"/></span>
			</span>
			<span><xsl:call-template name="fileModified">
				<xsl:with-param name="delimiter">at</xsl:with-param>
			</xsl:call-template></span>
			<span><xsl:call-template name="sys:file-size">
					<xsl:with-param name="bytes" select="@size" />
					<xsl:with-param name="kind" select="@kind" />
				</xsl:call-template></span>
			<span>
				<xsl:value-of select="//Mime/*[@id=current()/@kind]/@name"/>
				<xsl:if test="substring( @mode, 1, 1 ) != 'd'"> file</xsl:if>
			</span>
		</div>
	</xsl:for-each>
</xsl:template>

<xsl:template name="fileView-icons">
	<xsl:for-each select="./*">
		<xsl:sort order="descending" select="substring( @mode, 1, 1 ) = 'd'"/>
		<xsl:sort order="ascending" select="@name"/>
		<div class="file">
			<xsl:attribute name="data-kind"><xsl:value-of select="@kind"/></xsl:attribute>

			<xsl:choose>
				<xsl:when test="(//Mime/*[@id=current()/@kind]/@preview = 'image' or //Mime/*[@id=current()/@kind]/@preview = 'svg') and substring( @mode, 1, 1 ) != 'l'">
					<div class="preview-box">
						<div class="preview-image">
							<xsl:attribute name="style">background-image: url('<xsl:call-template name="sys:get-file-path"/>?w=232&amp;h=148');</xsl:attribute>
						</div>
					</div>
				</xsl:when>
				<xsl:otherwise>
					<div class="item-icon">
						<xsl:call-template name="sys:icon-type"/>
						<xsl:if test="@kind != '_dir' and @kind != 'app'">
							<span><xsl:call-template name="sys:icon-kind"/></span>
						</xsl:if>
						<xsl:if test="substring( @mode, 1, 1 ) = 'l'">
							<div class="shortcut-item" style="background-image: url(~/icons/file-shortcut.png);"></div>
						</xsl:if>
					</div>
				</xsl:otherwise>
			</xsl:choose>

			<span class="name"><xsl:value-of select="@name"/></span>
		</div>
	</xsl:for-each>
</xsl:template>

<xsl:template name="fileModified">
	<xsl:param name="delimiter"/>
	<xsl:value-of select="@mDate"/>&#160;<xsl:value-of select="$delimiter"/>&#160;<span><xsl:value-of select="@mTime"/></span>
</xsl:template>

<xsl:template name="filePreview">
	<div class="column preview right-resize">
		<div class="preview-wrapper">
			<div class="file-preview">
				<xsl:choose>
					<xsl:when test="//Mime/*[@id=current()/@kind]/@preview = 'image' or //Mime/*[@id=current()/@kind]/@preview = 'svg'">
						<div class="preview-box preview-image">
							<xsl:attribute name="style">background-image: url('<xsl:call-template name="sys:get-file-path"/>?w=232&amp;h=148');</xsl:attribute>
						</div>
					</xsl:when>
					<xsl:when test="//Mime/*[@id=current()/@kind]/@preview = 'text'">
						<pre class="preview-box preview-text">
							<xsl:attribute name="data-path"><xsl:call-template name="sys:get-file-path"/></xsl:attribute>
							<svg class="svg-loading"><use>
								<xsl:attribute name="xlink:href">#svg-loading</xsl:attribute>
							</use></svg>
						</pre>
					</xsl:when>
					<xsl:when test="@kind = 'app'">
						<div class="file-app">
							<div class="app-icon">
								<xsl:attribute name="style">background-image: url(~/icons/<xsl:value-of select="@icon"/>.png);</xsl:attribute>
							</div>
						</div>
					</xsl:when>
					<xsl:otherwise>
						<div class="file-paper">
							<div class="generic-document"></div>
							<span>
								<xsl:attribute name="data-kind"><xsl:value-of select="@kind"/></xsl:attribute>
								<xsl:call-template name="sys:icon-kind"/>
							</span>
						</div>
					</xsl:otherwise>
				</xsl:choose>
			</div>
			<div class="file-details">
				<div class="detail-row item-name">
					<xsl:value-of select="@name"/>
				</div>
				<div class="detail-row item-ext">
					<var>Kind</var>
					<span>
						<xsl:value-of select="//Mime/*[@id=current()/@kind]/@name"/>
						<xsl:if test="not(//Mime/*[@id=current()/@kind])"><xsl:value-of select="@kind"/></xsl:if>
						<xsl:if test="@kind != 'app'">file</xsl:if>
					</span>
				</div>
				<div class="detail-row item-size">
					<var>Size</var>
					<span><xsl:call-template name="sys:file-size">
							<xsl:with-param name="bytes" select="@size" />
						</xsl:call-template></span>
				</div>
				<!--
				<xsl:if test="//Mime/*[@id=current()/@kind]/@preview = 'image'">
					<div class="detail-row item-dim">
						<var>Dimensions</var>
						<span>1x1</span>
					</div>
				</xsl:if>
				-->
				<div class="detail-row item-date">
					<var>Modified</var>
					<span><xsl:call-template name="fileModified"/></span>
				</div>
			</div>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>


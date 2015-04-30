using log4net;
using System;
using System.Reflection;
using Umbraco.Core;
using Umbraco.Web.Models.Trees;
using Umbraco.Web.Trees;

namespace NW.ThinkOfTheChildren
{
    public class ContextMenuLoader : ApplicationEventHandler
    {
        private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication,
            ApplicationContext applicationContext)
        {
            TreeControllerBase.MenuRendering += TreeControllerBase_MenuRendering;
        }

        void TreeControllerBase_MenuRendering(TreeControllerBase sender, MenuRenderingEventArgs e)
        {
            if (e.Menu == null) return;
            {
                switch (sender.TreeAlias)
                {
                    case "content":
                        AddThinkOfTheChildrenMenuItem(e);
                        break;
                }
            }
        }      

        /// <summary>
        /// Add a menu item to all nodes to show/hide unpublished children
        /// </summary>
        /// <param name="e"></param>
        /// <returns></returns>
        private void AddThinkOfTheChildrenMenuItem(MenuRenderingEventArgs e)
        {
            try
            {
                var cs = new Umbraco.Core.Services.ContentService();

                var node = cs.GetById(int.Parse(e.NodeId));
                if (node.Id != 0)
                {
                    MenuItem i = new MenuItem("thinkOfTheChildren", "Think of the children!");
                    i.AdditionalData.Add("jsAction", "totc_toggleUnpublished()");

                    e.Menu.Items.Add(i);
                }
            }
            catch (Exception ex)
            {
                log.Error("Error adding show/hide unpublished for node " + e.NodeId, ex);
            }
        }
    }
}
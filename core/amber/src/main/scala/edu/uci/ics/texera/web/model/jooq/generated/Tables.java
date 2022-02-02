/*
 * This file is generated by jOOQ.
 */
package edu.uci.ics.texera.web.model.jooq.generated;


import edu.uci.ics.texera.web.model.jooq.generated.tables.File;
import edu.uci.ics.texera.web.model.jooq.generated.tables.FileOfProject;
import edu.uci.ics.texera.web.model.jooq.generated.tables.KeywordDictionary;
import edu.uci.ics.texera.web.model.jooq.generated.tables.User;
import edu.uci.ics.texera.web.model.jooq.generated.tables.UserConfig;
import edu.uci.ics.texera.web.model.jooq.generated.tables.UserFileAccess;
import edu.uci.ics.texera.web.model.jooq.generated.tables.UserProject;
import edu.uci.ics.texera.web.model.jooq.generated.tables.Workflow;
import edu.uci.ics.texera.web.model.jooq.generated.tables.WorkflowOfProject;
import edu.uci.ics.texera.web.model.jooq.generated.tables.WorkflowExecutions;
import edu.uci.ics.texera.web.model.jooq.generated.tables.WorkflowOfUser;
import edu.uci.ics.texera.web.model.jooq.generated.tables.WorkflowUserAccess;
import edu.uci.ics.texera.web.model.jooq.generated.tables.WorkflowVersion;


/**
 * Convenience access to all tables in texera_db
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Tables {

    /**
     * The table <code>texera_db.file</code>.
     */
    public static final File FILE = File.FILE;

    /**
     * The table <code>texera_db.file_of_project</code>.
     */
    public static final FileOfProject FILE_OF_PROJECT = FileOfProject.FILE_OF_PROJECT;

    /**
     * The table <code>texera_db.keyword_dictionary</code>.
     */
    public static final KeywordDictionary KEYWORD_DICTIONARY = KeywordDictionary.KEYWORD_DICTIONARY;

    /**
     * The table <code>texera_db.user</code>.
     */
    public static final User USER = User.USER;

    /**
     * The table <code>texera_db.user_config</code>.
     */
    public static final UserConfig USER_CONFIG = UserConfig.USER_CONFIG;

    /**
     * The table <code>texera_db.user_file_access</code>.
     */
    public static final UserFileAccess USER_FILE_ACCESS = UserFileAccess.USER_FILE_ACCESS;

    /**
     * The table <code>texera_db.user_project</code>.
     */
    public static final UserProject USER_PROJECT = UserProject.USER_PROJECT;

    /**
     * The table <code>texera_db.workflow</code>.
     */
    public static final Workflow WORKFLOW = Workflow.WORKFLOW;

    /**
     * The table <code>texera_db.workflow_of_project</code>.
     */
    public static final WorkflowOfProject WORKFLOW_OF_PROJECT = WorkflowOfProject.WORKFLOW_OF_PROJECT;

    /**
     * The table <code>texera_db.workflow_executions</code>.
     */
    public static final WorkflowExecutions WORKFLOW_EXECUTIONS = WorkflowExecutions.WORKFLOW_EXECUTIONS;

    /**
     * The table <code>texera_db.workflow_of_user</code>.
     */
    public static final WorkflowOfUser WORKFLOW_OF_USER = WorkflowOfUser.WORKFLOW_OF_USER;

    /**
     * The table <code>texera_db.workflow_user_access</code>.
     */
    public static final WorkflowUserAccess WORKFLOW_USER_ACCESS = WorkflowUserAccess.WORKFLOW_USER_ACCESS;

    /**
     * The table <code>texera_db.workflow_version</code>.
     */
    public static final WorkflowVersion WORKFLOW_VERSION = WorkflowVersion.WORKFLOW_VERSION;
}
